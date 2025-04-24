//Original deployments all share the same addresses
export const v0Addresses: Map<string, string> = new Map();
v0Addresses.set("authority", "0x007A0F48A4e3d74Ab4234adf9eA9EB32f87b4b14");
v0Addresses.set("aggregator", "0x007A66A2a13415DB3613C1a4dd1C942A285902d1");
v0Addresses.set(
  "fixedExpiryTeller",
  "0x007FE70dc9797C4198528aE43d8195ffF82Bdc95"
);
v0Addresses.set(
  "fixedExpirySDAAuctioneer",
  "0x007FEA32545a39Ff558a1367BBbC1A22bc7ABEfD"
);
v0Addresses.set(
  "fixedExpirySDAv1_1Auctioneer",
  "0xFE5DA041e5a3941BA12EbaBA7A7492BEAf91B646"
);
v0Addresses.set(
  "fixedExpiryFPAAuctioneer",
  "0xFEF9A53AA10Ce2C9Ab6519AEE7DF82767F504f55"
);
v0Addresses.set(
  "fixedExpiryOFDAAuctioneer",
  "0xFE0FDA2ACB13249099E5edAc64439ac76C7eF4B6"
);
v0Addresses.set(
  "fixedExpiryOSDAAuctioneer",
  "0xFE05DA9fffc72027C26E2327A9e6339670CD1b90"
);
v0Addresses.set(
  "fixedTermTeller",
  "0x007F7735baF391e207E3aA380bb53c4Bd9a5Fed6"
);
v0Addresses.set(
  "fixedTermSDAAuctioneer",
  "0x007F7A1cb838A872515c8ebd16bE4b14Ef43a222"
);
v0Addresses.set(
  "fixedTermSDAv1_1Auctioneer",
  "0xF75DA09c8538b7AFe8B9D3adC1d626dA5D33467F"
);
v0Addresses.set(
  "fixedTermFPAAuctioneer",
  "0xF7F9A96cDBFEFd70BDa14a8f30EC503b16bCe9b1"
);
v0Addresses.set(
  "fixedTermOFDAAuctioneer",
  "0xF70FDAae514a8b48B83caDa51C0847B46Bb698bd"
);
v0Addresses.set(
  "fixedTermOSDAAuctioneer",
  "0xF705DA9476a172408e1B94b2A7B2eF595A91C29b"
);
v0Addresses.set("settlement", "0x007105D27BCe31CcFFA76Fc191886e944606E34a");

export const v1AddressesChains = [
  137, 80001, 56, 34443, 80084, 84532, 8453, 80094,
];

//Contract addresses for new deployments
export const v1Addresses: Map<string, string> = new Map();
v1Addresses.set("authority", "0x007A2F0A16bd0874CA2e1FFfAfc2d6B0b876aA8E");
v1Addresses.set("aggregator", "0x007A6621A9997A633Cb1B757f2f7ffb51310704A");
v1Addresses.set(
  "fixedExpiryTeller",
  "0x007FE7c977a584CC54269730d210D889a86Ff9Cf"
);
v1Addresses.set(
  "fixedExpirySDAv1_1Auctioneer",
  "0xFE5DA8cF974EaC29606EDce195BF7fAbfC570f1C"
);
v1Addresses.set(
  "fixedExpiryFPAAuctioneer",
  "0xFEF9A1BB7c9AFd5F31c58Cf87Cefc639bDfA04Dd"
);
v1Addresses.set(
  "fixedExpiryOFDAAuctioneer",
  "0xFE0FDAD3969BbD8dd94c0bda7b04eC4ab66fFf85"
);
v1Addresses.set(
  "fixedExpiryOSDAAuctioneer",
  "0xFE05DA30aF9cfAc9bCfC911273F83fDcbb04Ae22"
);
v1Addresses.set(
  "fixedTermTeller",
  "0x007F774351e541b8bc720018De0796c4BF5afE3D"
);
v1Addresses.set(
  "fixedTermSDAv1_1Auctioneer",
  "0xF75DA1E6eA0521da0cb938D2F96bfe1Da5929557"
);
v1Addresses.set(
  "fixedTermFPAAuctioneer",
  "0xF7F9A834CBD3075D4810A9b818f594312C0de168"
);
v1Addresses.set(
  "fixedTermOFDAAuctioneer",
  "0xF70FDA7c9C397CE958320Db5C481939F0a8bb08D"
);
v1Addresses.set(
  "fixedTermOSDAAuctioneer",
  "0xF705DA88cd0AAeed5EA612502Fb9E5E7f1A5c2bD"
);
v1Addresses.set("settlement", "0x007102170E678984738f687E5b70F89Ad7ACa85e");
//TODO: remove these, they dont exist on new deployments
v1Addresses.set(
  "fixedExpirySDAAuctioneer",
  "0x007FEA32545a39Ff558a1367BBbC1A22bc7ABEfD"
);
v1Addresses.set(
  "fixedTermSDAAuctioneer",
  "0x007F7A1cb838A872515c8ebd16bE4b14Ef43a222"
);

export const v2Addresses: Map<string, string> = new Map();
v2Addresses.set("authority", "0x007A0F3b90c97ab8c5eE7f3b142204Ad819edB3A");
v2Addresses.set("aggregator", "0x007A66b5358D0e2a07C0eE078908517d186c1108");
v2Addresses.set(
  "fixedTermTeller",
  "0x007F77eF813B60a07af960dDA509137f6cCecdCa"
);
v2Addresses.set(
  "fixedTermSDAv1_1Auctioneer",
  "0xF75DA8A0803b02978498371562800488cDB4665F"
);
v2Addresses.set(
  "fixedTermFPAAuctioneer",
  "0xF7F9AcFd8CF2dd78ADe9E5b02B6e776655Ae62a1"
);

export const addressesByChain: Map<number, Map<string, string>> = new Map();

//V0
addressesByChain.set(1, v0Addresses);
addressesByChain.set(42161, v0Addresses);
addressesByChain.set(10, v0Addresses);
addressesByChain.set(137, v0Addresses);

//V1
addressesByChain.set(137, v1Addresses);
addressesByChain.set(80001, v1Addresses);
addressesByChain.set(56, v1Addresses);
addressesByChain.set(34443, v1Addresses);
addressesByChain.set(84532, v1Addresses);
addressesByChain.set(80084, v1Addresses);
addressesByChain.set(8453, v1Addresses);
addressesByChain.set(80094, v1Addresses);

//V2
addressesByChain.set(146, v2Addresses);
