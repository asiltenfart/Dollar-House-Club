import "Burner"
import "RandomBeaconHistory"
import "Xorshift128plus"

/// RandomConsumer provides secure commit-reveal randomness consumption on Flow.
/// Copied from the official Flow random-coin-toss example.
///
access(all) contract RandomConsumer {

    access(all) let ConsumerStoragePath: StoragePath

    access(all) event RandomnessRequested(requestUUID: UInt64, block: UInt64)
    access(all) event RandomnessSourced(requestUUID: UInt64, block: UInt64, randomSource: [UInt8])
    access(all) event RandomnessFulfilled(requestUUID: UInt64, randomResult: UInt64)

    access(all) fun getRevertibleRandomInRange(min: UInt64, max: UInt64): UInt64 {
        return min + revertibleRandom<UInt64>(modulo: max - min + 1)
    }

    access(all) fun getNumberInRange(prg: &Xorshift128plus.PRG, min: UInt64, max: UInt64): UInt64 {
        pre {
            min < max: "min must be less than max"
        }
        let range = max - min
        let bitsRequired = UInt256(self._mostSignificantBit(range))
        let mask: UInt256 = (1 << bitsRequired) - 1
        let shiftLimit: UInt256 = 256 / bitsRequired
        var shifts: UInt256 = 0
        var candidate: UInt64 = 0
        var value: UInt256 = prg.nextUInt256()

        while true {
            candidate = UInt64(value & mask)
            if candidate <= range {
                break
            }
            value = value >> bitsRequired
            shifts = shifts + 1
            if shifts == shiftLimit {
                value = prg.nextUInt256()
                shifts = 0
            }
        }
        return min + candidate
    }

    access(all) fun createConsumer(): @Consumer {
        return <-create Consumer()
    }

    access(all) entitlement Commit
    access(all) entitlement Reveal

    access(all) resource interface RequestWrapper {
        access(all) var request: @Request?

        access(all) view fun getRequestBlock(): UInt64? {
            post {
                result == nil || result! == self.request?.block:
                "Must return nil or the block height of request"
            }
            return self.request?.block ?? nil
        }

        access(all) view fun canFullfillRequest(): Bool {
            post {
                result == self.request?.canFullfill() ?? false:
                "Must return request.canFullfill()"
            }
            return self.request?.canFullfill() ?? false
        }

        access(Reveal) fun popRequest(): @Request {
            pre { self.request != nil: "Request must not be nil" }
            post {
                self.request == nil: "Request must be nil after pop"
                result.uuid == before((self.request?.uuid)!): "UUID must match"
            }
            let req <- self.request <- nil
            return <-req!
        }
    }

    access(all) resource Request {
        access(all) let block: UInt64
        access(all) var fulfilled: Bool

        init(_ blockHeight: UInt64) {
            pre {
                getCurrentBlock().height <= blockHeight:
                "Cannot request randomness for past block"
            }
            self.block = blockHeight
            self.fulfilled = false
        }

        access(all) view fun canFullfill(): Bool {
            return !self.fulfilled && getCurrentBlock().height > self.block
        }

        access(contract) fun _fulfill(): [UInt8] {
            pre {
                !self.fulfilled: "Already fulfilled"
                self.block < getCurrentBlock().height: "Cannot fulfill before eligible block"
            }
            self.fulfilled = true
            let res = RandomBeaconHistory.sourceOfRandomness(atBlockHeight: self.block).value
            emit RandomnessSourced(requestUUID: self.uuid, block: self.block, randomSource: res)
            return res
        }
    }

    access(all) resource Consumer {

        access(Commit) fun requestRandomness(): @Request {
            let currentHeight = getCurrentBlock().height
            let req <- create Request(currentHeight)
            emit RandomnessRequested(requestUUID: req.uuid, block: req.block)
            return <-req
        }

        access(Reveal) fun fulfillRandomRequest(_ request: @Request): UInt64 {
            let reqUUID = request.uuid
            let prg = self._getPRGFromRequest(request: <-request)
            let res = prg.nextUInt64()
            emit RandomnessFulfilled(requestUUID: reqUUID, randomResult: res)
            return res
        }

        access(Reveal) fun fulfillRandomInRange(request: @Request, min: UInt64, max: UInt64): UInt64 {
            pre { min < max: "min must be less than max" }
            let reqUUID = request.uuid
            let prg = self._getPRGFromRequest(request: <-request)
            let prgRef: &Xorshift128plus.PRG = &prg
            let res = RandomConsumer.getNumberInRange(prg: prgRef, min: min, max: max)
            emit RandomnessFulfilled(requestUUID: reqUUID, randomResult: res)
            return res
        }

        access(Reveal) fun fulfillWithPRG(request: @Request): Xorshift128plus.PRG {
            return self._getPRGFromRequest(request: <-request)
        }

        access(self) fun _getPRGFromRequest(request: @Request): Xorshift128plus.PRG {
            let source = request._fulfill()
            let salt = request.uuid.toBigEndianBytes()
            Burner.burn(<-request)
            return Xorshift128plus.PRG(sourceOfRandomness: source, salt: salt)
        }
    }

    access(self) view fun _mostSignificantBit(_ x: UInt64): UInt8 {
        var bits: UInt8 = 0
        var tmp: UInt64 = x
        while tmp > 0 {
            tmp = tmp >> 1
            bits = bits + 1
        }
        return bits
    }

    init() {
        self.ConsumerStoragePath = StoragePath(identifier: "RandomConsumer_".concat(self.account.address.toString()))!
        self.account.storage.save(<-create Consumer(), to: /storage/randomConsumer)
    }
}
