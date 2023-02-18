"""
Based on https://github.com/jangler/s3mml
"""
import struct
import dataclasses
from pathlib import Path
from typing import IO, Union, Optional, Tuple, List, Generator


NOTE_NAMES = (
    'C-', 'C#', 'D-', 'D#', 'E-', 'F-', 'F#', 'G-', 'G#', 'A-', 'A#', 'B-',
)


@dataclasses.dataclass
class Header:
    filename: Optional[str] = None
    title: str = ""
    numorders: int = 0
    numinstruments: int = 0
    numpatterns: int = 0
    flags: int = 0
    trackerversion: int = 0
    sampletype: int = 0
    globalvolume: int = 0
    initialspeed: int = 0
    initialtempo: int = 0
    mastervolume: int = 0
    ultraclickremoval: int = 0
    defaultpan: int = 0
    channelsettings: Tuple[int, ...] = tuple()
    orderlist: Tuple[int, ...] = tuple()
    ptrinstruments: List[int] = tuple()
    ptrpatterns: List[int] = tuple()


@dataclasses.dataclass
class Instrument:
    type: int = 0
    title: str = ""
    filename: str = ""
    length: Optional[int] = None
    loop_start: Optional[int] = None
    loop_end: Optional[int] = None
    volume: int = 0


@dataclasses.dataclass
class Operator:
    tremolo: int = 0
    vibrato: int = 0
    sustainsound: int = 0
    scaleenv: int = 0
    freqmult: int = 0
    levelscaling: int = 0
    volume: int = 0
    attack: int = 0
    decay: int = 0
    sustain: int = 0
    release: int = 0
    waveselect: int = 0


@dataclasses.dataclass
class ChannelRow:
    note: Optional[int] = None
    instrument: Optional[int] = None
    volume: Optional[int] = None
    effect: Optional[int] = None
    param: Optional[int] = None


PatternType = List[List[Optional[ChannelRow]]]


class S3m:

    character_encoding = "CP437"

    def __init__(self):
        self.header = Header()
        self.instruments: List[Instrument] = []
        self.patterns: List[ChannelRow] = []

    @classmethod
    def from_bytes(cls, buf: bytes) -> "S3m":
        s3m = cls()
        s3m._read_header(buf)
        s3m._read_instruments(buf)
        s3m._read_patterns(buf)
        return s3m

    @classmethod
    def from_file(cls, name: Union[str, Path]) -> "S3m":
        m = cls.from_bytes(Path(name).read_bytes())
        m.header.filename = str(name)
        return m

    def dump(self, file: Optional[IO[str]] = None):
        print(self.header.title, file=file)
        for inst in self.instruments:
            print(f"  {inst.type} {inst.title:28} {inst.volume or 0:2} {inst.length or 0:5}", file=file)

    def iter_patterns(self) -> Generator[Tuple[int, PatternType], None, None]:
        for pattern_idx in self.header.orderlist:
            if pattern_idx == 255:
                break
            yield pattern_idx, self.patterns[pattern_idx]

    def _to_string(self, b: bytes) -> str:
        return b.decode(self.character_encoding).strip("\0")

    def _read_header(self, buf: bytes):
        m = self.header
        m.title = self._to_string(struct.unpack_from('<28s', buf, 0)[0])
        m.numorders, m.numinstruments, m.numpatterns, m.flags, m.trackerversion, m.sampletype \
            = struct.unpack_from('<6H', buf, 32)
        m.globalvolume, m.initialspeed, m.initialtempo, m.mastervolume, \
            m.ultraclickremoval, m.defaultpan = struct.unpack_from('<6B', buf, 48)
        m.channelsettings = struct.unpack_from('<32B', buf, 64)
        pos = 96
        m.orderlist = struct.unpack_from('<%dB' % m.numorders, buf, pos)
        pos += m.numorders
        m.ptrinstruments = [
            x * 16
            for x in struct.unpack_from('<%dH' % m.numinstruments, buf, pos)
        ]
        pos += m.numinstruments * 2
        m.ptrpatterns = [
            x * 16
            for x in struct.unpack_from('<%dH' % m.numpatterns, buf, pos)
        ]

    def _read_instruments(self, buf: bytes):
        """Read instrument information from buf into m."""
        self.instruments = []
        for ptr in self.header.ptrinstruments:
            inst = Instrument()
            inst.type = struct.unpack_from('B', buf, ptr)[0]
            inst.filename = self._to_string(struct.unpack_from('12s', buf, ptr + 1)[0])

            if inst.type == 0:  # empty instrument
                inst.title = self._to_string(struct.unpack_from('28s', buf, ptr + 49)[0])

            elif inst.type == 1:  # sample-based
                pos = ptr + 13
                sample_ptr1 = struct.unpack_from('B', buf, pos)[0]
                sample_ptr2 = struct.unpack_from('<H', buf, pos + 1)[0]
                inst.sample_ptr = (sample_ptr1 << 16) + sample_ptr2
                pos += 3

                inst.length, inst.loop_start, inst.loop_end = struct.unpack_from('<3I', buf, pos)
                pos += 12
                inst.volume, _reserved, inst.pack, inst.flags = struct.unpack_from('4B', buf, pos)
                pos += 4
                inst.c2spd = struct.unpack_from('<I', buf, pos)
                pos += 4 + 12
                inst.title = self._to_string(struct.unpack_from('28s', buf, pos)[0])

            elif inst.type >= 2:  # OPL
                oplvalues = struct.unpack_from('<12B', buf, ptr + 16)
                inst.feedback = oplvalues[10] >> 1
                inst.connection = oplvalues[10] & 1 != 0
                inst.carrier, inst.modulator = Operator(), Operator()
                for offset, op in enumerate([inst.modulator, inst.carrier]):
                    op.tremolo = oplvalues[offset] & 0x80 != 0
                    op.vibrato = oplvalues[offset] & 0x40 != 0
                    op.sustainsound = oplvalues[offset] & 0x20 != 0
                    op.scaleenv = oplvalues[offset] & 0x10 != 0
                    op.freqmult = oplvalues[offset] & 0xf
                    op.levelscaling = (oplvalues[offset+2] & 0xc0) >> 6
                    op.volume = 63 - (oplvalues[offset+2] & 0x3f)
                    op.attack = (oplvalues[offset+4] & 0xf0) >> 4
                    op.decay = oplvalues[offset+4] & 0x0f
                    op.sustain = 15 - ((oplvalues[offset+6] & 0xf0) >> 4)
                    op.release = oplvalues[offset+6] & 0x0f
                    op.waveselect = oplvalues[offset+8]

                inst.volume, inst.c2spd = struct.unpack_from('<B3xI', buf, ptr + 28)
                inst.title = self._to_string(struct.unpack_from('28s', buf, ptr + 36)[0])

            self.instruments.append(inst)

    def _read_patterns(self, buf: bytes):
        self.patterns = []
        for ptr in self.header.ptrpatterns:
            pat = []
            ptr += 2  # skip packed length bytes
            for i in range(64):
                row: List[Optional[ChannelRow]] = [None for _ in range(32)]
                while True:
                    try:
                        what = struct.unpack_from('B', buf, ptr)[0]
                    except struct.error:
                        print(f"READ ERROR: ptr={ptr} len(buf)={len(buf)} patterns={len(self.patterns)}")
                        return
                    ptr += 1
                    if what == 0:
                        break
                    data = [None, None, None, None, None]
                    if what & 0x20:  # note and instrument
                        data[0], data[1] = struct.unpack_from('BB', buf, ptr)
                        ptr += 2
                    if what & 0x40:  # volume
                        data[2] = struct.unpack_from('B', buf, ptr)[0]
                        ptr += 1
                    if what & 0x80:  # effect and parameter(s)
                        data[3], data[4] = struct.unpack_from('BB', buf, ptr)
                        ptr += 2
                    row[what & 0x1f] = ChannelRow(*data)
                    
                pat.append(row)

            self.patterns.append(pat)
