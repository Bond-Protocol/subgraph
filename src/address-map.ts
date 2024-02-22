export const newAddressChains = [137, 80001];

//Original deployments all share the same addresses
export const oldAddresses: Map<string, string> = new Map();
oldAddresses.set("authority", "0x007A0F48A4e3d74Ab4234adf9eA9EB32f87b4b14");
oldAddresses.set("aggregator", "0x007A66A2a13415DB3613C1a4dd1C942A285902d1");
oldAddresses.set(
  "fixedExpiryTeller",
  "0x007FE70dc9797C4198528aE43d8195ffF82Bdc95"
);
oldAddresses.set(
  "fixedExpirySDAAuctioneer",
  "0x007FEA32545a39Ff558a1367BBbC1A22bc7ABEfD"
);
oldAddresses.set(
  "fixedExpirySDAv1_1Auctioneer",
  "0xFE5DA041e5a3941BA12EbaBA7A7492BEAf91B646"
);
oldAddresses.set(
  "fixedExpiryFPAAuctioneer",
  "0xFEF9A53AA10Ce2C9Ab6519AEE7DF82767F504f55"
);
oldAddresses.set(
  "fixedExpiryOFDAAuctioneer",
  "0xFE0FDA2ACB13249099E5edAc64439ac76C7eF4B6"
);
oldAddresses.set(
  "fixedExpiryOSDAAuctioneer",
  "0xFE05DA9fffc72027C26E2327A9e6339670CD1b90"
);
oldAddresses.set(
  "fixedTermTeller",
  "0x007F7735baF391e207E3aA380bb53c4Bd9a5Fed6"
);
oldAddresses.set(
  "fixedTermSDAAuctioneer",
  "0x007F7A1cb838A872515c8ebd16bE4b14Ef43a222"
);
oldAddresses.set(
  "fixedTermSDAv1_1Auctioneer",
  "0xF75DA09c8538b7AFe8B9D3adC1d626dA5D33467F"
);
oldAddresses.set(
  "fixedTermFPAAuctioneer",
  "0xF7F9A96cDBFEFd70BDa14a8f30EC503b16bCe9b1"
);
oldAddresses.set(
  "fixedTermOFDAAuctioneer",
  "0xF70FDAae514a8b48B83caDa51C0847B46Bb698bd"
);
oldAddresses.set(
  "fixedTermOSDAAuctioneer",
  "0xF705DA9476a172408e1B94b2A7B2eF595A91C29b"
);
oldAddresses.set("settlement", "0x007105D27BCe31CcFFA76Fc191886e944606E34a");

//Contract addresses for new deployments
export const newAddresses: Map<string, string> = new Map();
newAddresses.set("authority", "0x007A2F0A16bd0874CA2e1FFfAfc2d6B0b876aA8E");
newAddresses.set("aggregator", "0x007A6621A9997A633Cb1B757f2f7ffb51310704A");
newAddresses.set(
  "fixedExpiryTeller",
  "0x007FE7c977a584CC54269730d210D889a86Ff9Cf"
);
newAddresses.set(
  "fixedExpirySDAv1_1Auctioneer",
  "0xFE5DA8cF974EaC29606EDce195BF7fAbfC570f1C"
);
newAddresses.set(
  "fixedExpiryFPAAuctioneer",
  "0xFEF9A1BB7c9AFd5F31c58Cf87Cefc639bDfA04Dd"
);
newAddresses.set(
  "fixedExpiryOFDAAuctioneer",
  "0xFE0FDAD3969BbD8dd94c0bda7b04eC4ab66fFf85"
);
newAddresses.set(
  "fixedExpiryOSDAAuctioneer",
  "0xFE05DA30aF9cfAc9bCfC911273F83fDcbb04Ae22"
);
newAddresses.set(
  "fixedTermTeller",
  "0x007F774351e541b8bc720018De0796c4BF5afE3D"
);
newAddresses.set(
  "fixedTermSDAv1_1Auctioneer",
  "0xF75DA1E6eA0521da0cb938D2F96bfe1Da5929557"
);
newAddresses.set(
  "fixedTermFPAAuctioneer",
  "0xF7F9A834CBD3075D4810A9b818f594312C0de168"
);
newAddresses.set(
  "fixedTermOFDAAuctioneer",
  "0xF70FDA7c9C397CE958320Db5C481939F0a8bb08D"
);
newAddresses.set(
  "fixedTermOSDAAuctioneer",
  "0xF705DA88cd0AAeed5EA612502Fb9E5E7f1A5c2bD"
);
newAddresses.set("settlement", "0x007102170E678984738f687E5b70F89Ad7ACa85e");
//TODO: remove these, they dont exist on new deployments
newAddresses.set(
  "fixedExpirySDAAuctioneer",
  "0x007FEA32545a39Ff558a1367BBbC1A22bc7ABEfD"
);
newAddresses.set(
  "fixedTermSDAAuctioneer",
  "0x007F7A1cb838A872515c8ebd16bE4b14Ef43a222"
);

export const addressesByChain: Map<number, Map<string, string>> = new Map();

addressesByChain.set(137, newAddresses);
addressesByChain.set(80001, newAddresses);
