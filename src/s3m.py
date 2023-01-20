"""
Based on https://github.com/jangler/s3mml
"""
import struct
import dataclasses
from pathlib import Path
from typing import List, IO, Union, Optional


NOTE_NAMES = (
    'C-',
    'C#',
    'D-',
    'D#',
    'E-',
    'F-',
    'F#',
    'G-',
    'G#',
    'A-',
    'A#',
    'B-',
)


class S3m:

    class Header:
        pass

    @dataclasses.dataclass
    class Instrument:
        type: int = 0
        title: str = ""
        filename: str = ""
        length: Optional[int] = None
        loop_start: Optional[int] = None
        loop_end: Optional[int] = None
        volume: int = 0

    class Operator:
        pass

    def __init__(self):
        self.header = self.Header()
        self.instruments: List[self.Instrument] = []
        self.patterns: List = []

    @classmethod
    def from_bytes(cls, buf: bytes) -> "S3m":
        s3m = cls()
        s3m._read_header(buf)
        s3m._read_instruments(buf)
        #s3m._read_patterns(buf)
        return s3m

    @classmethod
    def from_file(cls, name: Union[str, Path]) -> "S3m":
        return cls.from_bytes(Path(name).read_bytes())

    def dump(self, file: Optional[IO[str]] = None):
        print(self.header.title, file=file)
        for inst in self.instruments:
            print(f"  {inst.type} {inst.title} {inst.filename} {inst.volume} {inst.length}", file=file)

    def _read_header(self, buf: bytes):
        m = self.header
        m.title = struct.unpack_from('<28s', buf, 0)[0].decode('latin1').strip('\0')
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
            inst = self.Instrument()
            inst.type = struct.unpack_from('<B', buf, ptr)[0]
            inst.filename = struct.unpack_from(
                '<12s', buf, ptr + 1
            )[0].decode('latin1').strip('\0')

            if inst.type >= 2:
                oplvalues = struct.unpack_from('<12B', buf, ptr + 16)
                inst.feedback = oplvalues[10] >> 1
                inst.connection = oplvalues[10] & 1 != 0
                inst.carrier, inst.modulator = self.Operator(), self.Operator()
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
                inst.title = struct.unpack_from(
                    '28s', buf, ptr + 36
                )[0].strip(b'\0')

            elif inst.type == 1:
                pos = ptr + 13
                sample_ptr1 = struct.unpack_from('<B', buf, pos)[0]
                sample_ptr2 = struct.unpack_from('<H', buf, pos + 1)[0]
                inst.sample_ptr = (sample_ptr1 << 16) + sample_ptr2
                pos += 3

                inst.length, inst.loop_start, inst.loop_end = struct.unpack_from('<3I', buf, pos)
                pos += 12
                inst.volume, _reserved, inst.pack, inst.flags = struct.unpack_from('4B', buf, pos)
                pos += 4
                inst.c2spd = struct.unpack_from('<I', buf, pos)
                pos += 4 + 12
                inst.title = struct.unpack_from('28s', buf, pos)[0].decode("latin1").strip("\0")

            self.instruments.append(inst)

    def _read_patterns(self, buf: bytes):
        self.patterns = []
        for ptr in self.header.ptrpatterns:
            pat = []
            ptr += 2  # skip packed length bytes
            for i in range(64):
                row = [None for j in range(32)]
                while True:
                    what = struct.unpack_from('B', buf, ptr)[0]
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
                    row[what & 0x1f] = data
                pat.append(row)
            self.patterns.append(pat)
