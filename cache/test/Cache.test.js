const Cache = artifacts.require('./Cache.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Cache', (accounts) => {
  let contract

  before(async () => {
    contract = await Cache.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = contract.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await contract.name()
      assert.equal(name, 'Cache')
    })

    it('has a symbol', async () => {
      const symbol = await contract.symbol()
      assert.equal(symbol, 'CACHE')
    })

  })

  describe('minting', async () => {

    it('creates a new token', async () => {
      const result = await contract.mint('https://ipfs.io/ipfs/QmXievn4WD2KtxY7Ayd7vN71vvqZTDdRkwANCsp6eZS2R7')
      const totalSupply = await contract.totalSupply()
      // SUCCESS
      assert.equal(totalSupply, 1)
      const event = result.logs[0].args
      assert.equal(event.tokenId.toNumber(), 1, 'id is correct')
      assert.equal(event.from, '0x0000000000000000000000000000000000000000', 'from is correct')
      assert.equal(event.to, accounts[0], 'to is correct')

      // FAILURE: cannot mint same cache twice
      await contract.mint('https://ipfs.io/ipfs/QmXievn4WD2KtxY7Ayd7vN71vvqZTDdRkwANCsp6eZS2R7').should.be.rejected;
    })
  })

  describe('indexing', async () => {
    it('lists caches', async () => {
      // Mint some more tokens
      // await contract.mint('https://ipfs.io/ipfs/QmXievn4WD2KtxY7Ayd7vN71vvqZTDdRkwANCsp6eZS2R8')
      const totalSupply = await contract.totalSupply()

      let cache
      let result = []

      for (var i = 1; i <= totalSupply; i++) {
        cache = await contract.caches(i - 1)
        result.push(cache)
      }

      let expected = ['https://ipfs.io/ipfs/QmXievn4WD2KtxY7Ayd7vN71vvqZTDdRkwANCsp6eZS2R7']
      assert.equal(result.join(','), expected.join(','))
    })
  })

})
