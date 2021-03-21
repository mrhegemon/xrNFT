pragma solidity ^0.5.16;

import "./ERC721Full.sol";

contract Cache is ERC721Full {
  string[] public caches;
  mapping(string => bool) _cacheExists;

  constructor() ERC721Full("Cache", "CACHE") public {
  }

  function mint(string memory _cache) public {
    require(!_cacheExists[_cache]);
    uint _id = caches.push(_cache);
    _mint(msg.sender, _id);
    _cacheExists[_cache] = true;
  }
}
