import Crypto

/// Xorshift128plus pseudo random generator (PRG) for secure onchain randomness.
/// Copied from the official Flow random-coin-toss example.
///
access(all) contract Xorshift128plus {

    access(all) struct PRG {
        access(all) var state0: Word64
        access(all) var state1: Word64

        init(sourceOfRandomness: [UInt8], salt: [UInt8]) {
            pre {
                sourceOfRandomness.length >= 16:
                "Provided entropy length=".concat(sourceOfRandomness.length.toString())
                .concat(" - at least 16 bytes of entropy should be used when initializing the PRG")
            }
            let tmp: [UInt8] = sourceOfRandomness.concat(salt)
            let hash: [UInt8] = Crypto.hash(tmp, algorithm: HashAlgorithm.SHA3_256)
            let seed: [UInt8] = hash.slice(from: 0, upTo: 16)

            let segment0: Word64 = Xorshift128plus._bigEndianBytesToWord64(bytes: seed, start: 0)
            let segment1: Word64 = Xorshift128plus._bigEndianBytesToWord64(bytes: seed, start: 8)

            assert(segment0 != 0 || segment1 != 0, message: "PRG initial state is 0")

            self.state0 = segment0
            self.state1 = segment1
        }

        access(all) fun nextUInt64(): UInt64 {
            var a: Word64 = self.state0
            let b: Word64 = self.state1
            self.state0 = b
            a = a ^ (a << 23)
            a = a ^ (a >> 17)
            a = a ^ b ^ (b >> 26)
            self.state1 = a
            return UInt64(Word64(a) + Word64(b))
        }

        access(all) fun nextUInt256(): UInt256 {
            var res = UInt256(self.nextUInt64())
            res = res | UInt256(self.nextUInt64()) << 64
            res = res | UInt256(self.nextUInt64()) << 128
            res = res | UInt256(self.nextUInt64()) << 192
            return res
        }
    }

    access(contract) fun _bigEndianBytesToWord64(bytes: [UInt8], start: Int): Word64 {
        pre {
            start + 8 <= bytes.length: "Need at least 8 bytes from start"
        }
        var value: UInt64 = 0
        var i: Int = 0
        while i < 8 {
            value = value << 8 | UInt64(bytes[start + i])
            i = i + 1
        }
        return Word64(value)
    }
}
