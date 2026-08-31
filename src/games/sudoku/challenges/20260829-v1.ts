import type { SudokuChallengeCatalogMeta, SudokuChallengeEntry } from './types'

export const CATALOG_META = {
  candidateCount: 10000,
  catalogId: '20260829-v1',
  difficulty: 'expert',
  threshold: 1000,
  variant: 'classic',
} as const satisfies SudokuChallengeCatalogMeta

export const CHALLENGES: readonly SudokuChallengeEntry[] = [
  {
    "analysis": {
      "candidateEliminations": 7,
      "clueCount": 25,
      "guessBranches": 319,
      "hardestTechnique": "search",
      "logicalPlacements": 2,
      "rating": 8082,
      "searchNodes": 3636,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 2,
        "locked-candidate": 4,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 54
    },
    "id": "20260829-v1-377",
    "puzzle": "004000100020000007005674002060009000500000826000800003000000710083000000050240008",
    "seed": 377,
    "solution": "674328159328195647195674382862539471539417826417862593246983715983751264751246938"
  },
  {
    "analysis": {
      "candidateEliminations": 14,
      "clueCount": 24,
      "guessBranches": 236,
      "hardestTechnique": "search",
      "logicalPlacements": 2,
      "rating": 6146,
      "searchNodes": 2854,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 2,
        "locked-candidate": 8,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 55
    },
    "id": "20260829-v1-668",
    "puzzle": "830000000000000159000004000003000000200560000000400912056708090008020000309000007",
    "seed": 668,
    "solution": "832915746674832159915674328483291675291567834567483912156748293748329561329156487"
  },
  {
    "analysis": {
      "candidateEliminations": 21,
      "clueCount": 25,
      "guessBranches": 214,
      "hardestTechnique": "search",
      "logicalPlacements": 5,
      "rating": 5636,
      "searchNodes": 3019,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 5,
        "locked-candidate": 6,
        "naked-pair": 0,
        "hidden-pair": 2,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 51
    },
    "id": "20260829-v1-532",
    "puzzle": "097060010000030000030500002800000100006000580203050006004620000020000094000070001",
    "seed": 532,
    "solution": "597462318462138957138597642859746123746213589213859476974621835621385794385974261"
  },
  {
    "analysis": {
      "candidateEliminations": 31,
      "clueCount": 25,
      "guessBranches": 161,
      "hardestTechnique": "search",
      "logicalPlacements": 5,
      "rating": 4398,
      "searchNodes": 1085,
      "techniques": {
        "naked-single": 2,
        "hidden-single": 3,
        "locked-candidate": 7,
        "naked-pair": 3,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 51
    },
    "id": "20260829-v1-774",
    "puzzle": "030015602007002400090000000060003070000070509000509200000007050080100004001000300",
    "seed": 774,
    "solution": "834715692517692438296438715965243871342871569178569243429387156783156924651924387"
  },
  {
    "analysis": {
      "candidateEliminations": 4,
      "clueCount": 27,
      "guessBranches": 155,
      "hardestTechnique": "search",
      "logicalPlacements": 4,
      "rating": 4094,
      "searchNodes": 1681,
      "techniques": {
        "naked-single": 2,
        "hidden-single": 2,
        "locked-candidate": 2,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 50
    },
    "id": "20260829-v1-214",
    "puzzle": "800000006000080530004617200700000000090050008001006000407060095000003007900700860",
    "seed": 214,
    "solution": "829435716176982534354617289768329451293154678541876923417268395682593147935741862"
  },
  {
    "analysis": {
      "candidateEliminations": 12,
      "clueCount": 25,
      "guessBranches": 152,
      "hardestTechnique": "search",
      "logicalPlacements": 7,
      "rating": 4060,
      "searchNodes": 1926,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 6,
        "locked-candidate": 2,
        "naked-pair": 0,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 49
    },
    "id": "20260829-v1-157",
    "puzzle": "010009020083000000600080070000000000590007010000046052001065090900070040065000000",
    "seed": 157,
    "solution": "714659823283714569659283174146592387592837416837146952371465298928371645465928731"
  },
  {
    "analysis": {
      "candidateEliminations": 2,
      "clueCount": 25,
      "guessBranches": 136,
      "hardestTechnique": "search",
      "logicalPlacements": 4,
      "rating": 3762,
      "searchNodes": 1733,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 4,
        "locked-candidate": 0,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 2
      },
      "unresolvedAfterLogic": 52
    },
    "id": "20260829-v1-173",
    "puzzle": "060070500050200000900000080000040000000300700080590046090000200003009008840030051",
    "seed": 173,
    "solution": "268973514451286379937415682579641823614328795382597146195864237723159468846732951"
  },
  {
    "analysis": {
      "candidateEliminations": 12,
      "clueCount": 24,
      "guessBranches": 115,
      "hardestTechnique": "search",
      "logicalPlacements": 7,
      "rating": 3217,
      "searchNodes": 1617,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 7,
        "locked-candidate": 4,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 1,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 50
    },
    "id": "20260829-v1-778",
    "puzzle": "010700900020000000600500381000008400100307005000000090030400000800170000004009700",
    "seed": 778,
    "solution": "318764952925831674647592381256918437189347265473625198731456829892173546564289713"
  },
  {
    "analysis": {
      "candidateEliminations": 16,
      "clueCount": 26,
      "guessBranches": 110,
      "hardestTechnique": "search",
      "logicalPlacements": 8,
      "rating": 3112,
      "searchNodes": 1315,
      "techniques": {
        "naked-single": 4,
        "hidden-single": 4,
        "locked-candidate": 5,
        "naked-pair": 0,
        "hidden-pair": 1,
        "x-wing": 1,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 47
    },
    "id": "20260829-v1-344",
    "puzzle": "000051009000000870002000061000070005069300000000065034008017040694030000000006000",
    "seed": 344,
    "solution": "387651429156249873942783561423178695569324718871965234238517946694832157715496382"
  },
  {
    "analysis": {
      "candidateEliminations": 11,
      "clueCount": 24,
      "guessBranches": 107,
      "hardestTechnique": "search",
      "logicalPlacements": 6,
      "rating": 2988,
      "searchNodes": 931,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 6,
        "locked-candidate": 1,
        "naked-pair": 0,
        "hidden-pair": 2,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 51
    },
    "id": "20260829-v1-476",
    "puzzle": "004007023170300500080000009007006000000030008400000200030080900000600070006000402",
    "seed": 476,
    "solution": "654917823179328564283465719327846195915732648468591237731284956842659371596173482"
  },
  {
    "analysis": {
      "candidateEliminations": 13,
      "clueCount": 24,
      "guessBranches": 104,
      "hardestTechnique": "search",
      "logicalPlacements": 7,
      "rating": 2936,
      "searchNodes": 1422,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 7,
        "locked-candidate": 4,
        "naked-pair": 0,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 50
    },
    "id": "20260829-v1-13",
    "puzzle": "070030100000059003000200000000000090000073006416000000040002739001000040030006050",
    "seed": 13,
    "solution": "975638124124759863863241975387164592592873416416925387648512739251397648739486251"
  },
  {
    "analysis": {
      "candidateEliminations": 21,
      "clueCount": 24,
      "guessBranches": 92,
      "hardestTechnique": "search",
      "logicalPlacements": 5,
      "rating": 2676,
      "searchNodes": 972,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 4,
        "locked-candidate": 5,
        "naked-pair": 2,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 52
    },
    "id": "20260829-v1-881",
    "puzzle": "100600004050700000807010000400000092300000480000806000083500009600000000000000738",
    "seed": 881,
    "solution": "132695874956784123847213965468137592371952486529846317783521649694378251215469738"
  },
  {
    "analysis": {
      "candidateEliminations": 13,
      "clueCount": 24,
      "guessBranches": 92,
      "hardestTechnique": "search",
      "logicalPlacements": 3,
      "rating": 2665,
      "searchNodes": 1092,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 3,
        "locked-candidate": 4,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 1,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 54
    },
    "id": "20260829-v1-765",
    "puzzle": "076050010000000900200000085040002300001000008528000000000040000800006700750003009",
    "seed": 765,
    "solution": "976458213485231976213967485647582391391674528528319647169745832832196754754823169"
  },
  {
    "analysis": {
      "candidateEliminations": 16,
      "clueCount": 25,
      "guessBranches": 91,
      "hardestTechnique": "search",
      "logicalPlacements": 1,
      "rating": 2625,
      "searchNodes": 1088,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 1,
        "locked-candidate": 4,
        "naked-pair": 0,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 55
    },
    "id": "20260829-v1-201",
    "puzzle": "041000020300000706000300010084000000005900000260000840090026030000003007000790005",
    "seed": 201,
    "solution": "841679523352841796679352418984267351135984672267135849798526134526413987413798265"
  },
  {
    "analysis": {
      "candidateEliminations": 20,
      "clueCount": 24,
      "guessBranches": 87,
      "hardestTechnique": "search",
      "logicalPlacements": 4,
      "rating": 2563,
      "searchNodes": 1413,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 3,
        "locked-candidate": 3,
        "naked-pair": 1,
        "hidden-pair": 2,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 53
    },
    "id": "20260829-v1-299",
    "puzzle": "000024000400500007090001003009000000000000150360010008050109080800600000070030006",
    "seed": 299,
    "solution": "187324965423596817695781243519847632748263159362915478256179384834652791971438526"
  },
  {
    "analysis": {
      "candidateEliminations": 6,
      "clueCount": 26,
      "guessBranches": 84,
      "hardestTechnique": "search",
      "logicalPlacements": 8,
      "rating": 2476,
      "searchNodes": 906,
      "techniques": {
        "naked-single": 2,
        "hidden-single": 6,
        "locked-candidate": 4,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 1
      },
      "unresolvedAfterLogic": 47
    },
    "id": "20260829-v1-138",
    "puzzle": "047103000009000000000080640905000314304000000060000005400591070000002006000030500",
    "seed": 138,
    "solution": "647153289289647153153289647925768314314925768768314925436591872591872436872436591"
  },
  {
    "analysis": {
      "candidateEliminations": 8,
      "clueCount": 24,
      "guessBranches": 86,
      "hardestTechnique": "search",
      "logicalPlacements": 11,
      "rating": 2457,
      "searchNodes": 1047,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 11,
        "locked-candidate": 3,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 46
    },
    "id": "20260829-v1-331",
    "puzzle": "000000000050301900892000400400020050000000308501000000070016830300000004010900000",
    "seed": 331,
    "solution": "143298576756341982892657413438729651927165348561834297275416839389572164614983725"
  },
  {
    "analysis": {
      "candidateEliminations": 14,
      "clueCount": 25,
      "guessBranches": 77,
      "hardestTechnique": "search",
      "logicalPlacements": 12,
      "rating": 2416,
      "searchNodes": 1253,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 11,
        "locked-candidate": 3,
        "naked-pair": 1,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 2
      },
      "unresolvedAfterLogic": 44
    },
    "id": "20260829-v1-224",
    "puzzle": "000000000017930000900452000391080060040700100000000000070100008136000400000000630",
    "seed": 224,
    "solution": "425671389617938524983452716391584267548726193762319845274163958136895472859247631"
  },
  {
    "analysis": {
      "candidateEliminations": 9,
      "clueCount": 24,
      "guessBranches": 82,
      "hardestTechnique": "search",
      "logicalPlacements": 6,
      "rating": 2391,
      "searchNodes": 991,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 6,
        "locked-candidate": 5,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 51
    },
    "id": "20260829-v1-150",
    "puzzle": "000000890001409007400005000010500000500370000000000480869050000040000968100000000",
    "seed": 150,
    "solution": "752613894631489257498725136916548723584372619327961485869254371245137968173896542"
  },
  {
    "analysis": {
      "candidateEliminations": 14,
      "clueCount": 26,
      "guessBranches": 81,
      "hardestTechnique": "search",
      "logicalPlacements": 7,
      "rating": 2368,
      "searchNodes": 817,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 7,
        "locked-candidate": 4,
        "naked-pair": 0,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 48
    },
    "id": "20260829-v1-827",
    "puzzle": "071008000009430000000007500090053700030000006700800000040006300000385000058020900",
    "seed": 827,
    "solution": "671598423589432671423617589896253714235741896714869235142976358967385142358124967"
  },
  {
    "analysis": {
      "candidateEliminations": 22,
      "clueCount": 24,
      "guessBranches": 76,
      "hardestTechnique": "search",
      "logicalPlacements": 17,
      "rating": 2356,
      "searchNodes": 683,
      "techniques": {
        "naked-single": 7,
        "hidden-single": 10,
        "locked-candidate": 4,
        "naked-pair": 2,
        "hidden-pair": 0,
        "x-wing": 1,
        "xy-wing": 0,
        "simple-chain": 1
      },
      "unresolvedAfterLogic": 40
    },
    "id": "20260829-v1-989",
    "puzzle": "320090076000000100090005030600000400000904008050000300100000080009000014036000900",
    "seed": 989,
    "solution": "328491576765328149491765832687213495213954768954687321142579683579836214836142957"
  },
  {
    "analysis": {
      "candidateEliminations": 10,
      "clueCount": 25,
      "guessBranches": 78,
      "hardestTechnique": "search",
      "logicalPlacements": 5,
      "rating": 2336,
      "searchNodes": 931,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 5,
        "locked-candidate": 3,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 1
      },
      "unresolvedAfterLogic": 51
    },
    "id": "20260829-v1-430",
    "puzzle": "000000300000000016230600905002005000700498600904000000007002160600050000000301000",
    "seed": 430,
    "solution": "176549328495823716238617945362175894751498632984236571547982163613754289829361457"
  },
  {
    "analysis": {
      "candidateEliminations": 5,
      "clueCount": 24,
      "guessBranches": 81,
      "hardestTechnique": "search",
      "logicalPlacements": 6,
      "rating": 2317,
      "searchNodes": 898,
      "techniques": {
        "naked-single": 5,
        "hidden-single": 1,
        "locked-candidate": 2,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 51
    },
    "id": "20260829-v1-20",
    "puzzle": "000010300401002050000050007250000008003000640000030005800060003000100820007009000",
    "seed": 20,
    "solution": "965417382471382956328956417259641738783295641614738295892564173546173829137829564"
  },
  {
    "analysis": {
      "candidateEliminations": 10,
      "clueCount": 25,
      "guessBranches": 72,
      "hardestTechnique": "search",
      "logicalPlacements": 8,
      "rating": 2184,
      "searchNodes": 903,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 8,
        "locked-candidate": 4,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 1,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 48
    },
    "id": "20260829-v1-309",
    "puzzle": "900000561000230000700060000000300200000050090003402850000020000485000020000004609",
    "seed": 309,
    "solution": "932847561561239748748165932856391274274658193193472856619723485485916327327584619"
  },
  {
    "analysis": {
      "candidateEliminations": 12,
      "clueCount": 24,
      "guessBranches": 73,
      "hardestTechnique": "search",
      "logicalPlacements": 4,
      "rating": 2183,
      "searchNodes": 788,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 4,
        "locked-candidate": 4,
        "naked-pair": 1,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 53
    },
    "id": "20260829-v1-722",
    "puzzle": "003000000080005204000070560100700600802090000039400000090060700000003050400000008",
    "seed": 722,
    "solution": "563142987987635214214879563145728639872396145639451872398564721721983456456217398"
  },
  {
    "analysis": {
      "candidateEliminations": 8,
      "clueCount": 24,
      "guessBranches": 74,
      "hardestTechnique": "search",
      "logicalPlacements": 6,
      "rating": 2166,
      "searchNodes": 974,
      "techniques": {
        "naked-single": 3,
        "hidden-single": 3,
        "locked-candidate": 1,
        "naked-pair": 0,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 51
    },
    "id": "20260829-v1-522",
    "puzzle": "000706000000408300007020080010003700200900400008000050003001900000000073090000602",
    "seed": 522,
    "solution": "854736291921458367637129584519843726276915438348672159783261945162594873495387612"
  },
  {
    "analysis": {
      "candidateEliminations": 9,
      "clueCount": 24,
      "guessBranches": 72,
      "hardestTechnique": "search",
      "logicalPlacements": 11,
      "rating": 2148,
      "searchNodes": 654,
      "techniques": {
        "naked-single": 2,
        "hidden-single": 9,
        "locked-candidate": 6,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 46
    },
    "id": "20260829-v1-451",
    "puzzle": "065000000000000802000104000000406020000017060490500000230009005000000090700608003",
    "seed": 451,
    "solution": "965823147174965832823174956317496528582317469496582371231749685658231794749658213"
  },
  {
    "analysis": {
      "candidateEliminations": 16,
      "clueCount": 25,
      "guessBranches": 70,
      "hardestTechnique": "search",
      "logicalPlacements": 6,
      "rating": 2127,
      "searchNodes": 567,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 6,
        "locked-candidate": 6,
        "naked-pair": 1,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 50
    },
    "id": "20260829-v1-266",
    "puzzle": "000010000500006008006407001050038000001000703000901000095000047003000250170000000",
    "seed": 266,
    "solution": "487519362519326478326487591652738914941652783738941625295863147863174259174295836"
  },
  {
    "analysis": {
      "candidateEliminations": 9,
      "clueCount": 24,
      "guessBranches": 70,
      "hardestTechnique": "search",
      "logicalPlacements": 5,
      "rating": 2086,
      "searchNodes": 955,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 5,
        "locked-candidate": 2,
        "naked-pair": 1,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 52
    },
    "id": "20260829-v1-589",
    "puzzle": "030006000709000000600020510100300080070200036000079000305000000010500800006000004",
    "seed": 589,
    "solution": "531486792729135648684927513152364987978251436463879125345698271217543869896712354"
  },
  {
    "analysis": {
      "candidateEliminations": 16,
      "clueCount": 24,
      "guessBranches": 64,
      "hardestTechnique": "search",
      "logicalPlacements": 3,
      "rating": 2057,
      "searchNodes": 634,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 2,
        "locked-candidate": 4,
        "naked-pair": 1,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 1
      },
      "unresolvedAfterLogic": 54
    },
    "id": "20260829-v1-983",
    "puzzle": "300400700010000000205000006090607000802300400000008900000000005431060080000020010",
    "seed": 983,
    "solution": "389416752614572893275983146193647528852391467746258931928134675431765289567829314"
  },
  {
    "analysis": {
      "candidateEliminations": 5,
      "clueCount": 25,
      "guessBranches": 69,
      "hardestTechnique": "search",
      "logicalPlacements": 5,
      "rating": 2047,
      "searchNodes": 880,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 5,
        "locked-candidate": 3,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 51
    },
    "id": "20260829-v1-262",
    "puzzle": "000500010000003009320080600070000900004000007980035200000090050100600023060007000",
    "seed": 262,
    "solution": "498576312657213489321984675573142968214869537986735241732491856149658723865327194"
  },
  {
    "analysis": {
      "candidateEliminations": 27,
      "clueCount": 25,
      "guessBranches": 65,
      "hardestTechnique": "search",
      "logicalPlacements": 6,
      "rating": 2046,
      "searchNodes": 592,
      "techniques": {
        "naked-single": 2,
        "hidden-single": 4,
        "locked-candidate": 7,
        "naked-pair": 1,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 50
    },
    "id": "20260829-v1-436",
    "puzzle": "000001070040090050001408006000080009000004010390000207600820000037009020005000000",
    "seed": 436,
    "solution": "963251874748693152521478396156782439872934615394516287619825743437169528285347961"
  },
  {
    "analysis": {
      "candidateEliminations": 8,
      "clueCount": 25,
      "guessBranches": 67,
      "hardestTechnique": "search",
      "logicalPlacements": 4,
      "rating": 2002,
      "searchNodes": 822,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 4,
        "locked-candidate": 3,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 52
    },
    "id": "20260829-v1-694",
    "puzzle": "070002009020600080000850000000100003000070600001038050803000906002000004010000530",
    "seed": 694,
    "solution": "578412369124693785936857241745126893389574612261938457853741926692385174417269538"
  },
  {
    "analysis": {
      "candidateEliminations": 11,
      "clueCount": 26,
      "guessBranches": 65,
      "hardestTechnique": "search",
      "logicalPlacements": 6,
      "rating": 1961,
      "searchNodes": 968,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 5,
        "locked-candidate": 4,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 49
    },
    "id": "20260829-v1-821",
    "puzzle": "109008000600105000084000009000000000925000030060070290000709402000000080000860901",
    "seed": 821,
    "solution": "159248763673195824284637519317952648925486137468371295836719452791524386542863971"
  },
  {
    "analysis": {
      "candidateEliminations": 6,
      "clueCount": 24,
      "guessBranches": 65,
      "hardestTechnique": "search",
      "logicalPlacements": 4,
      "rating": 1956,
      "searchNodes": 934,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 3,
        "locked-candidate": 3,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 53
    },
    "id": "20260829-v1-718",
    "puzzle": "000100006450600002070280050004070000000000060310000029040000000200300090005008100",
    "seed": 718,
    "solution": "832145976451697832976283451564972318729831564318456729143569287287314695695728143"
  },
  {
    "analysis": {
      "candidateEliminations": 5,
      "clueCount": 24,
      "guessBranches": 66,
      "hardestTechnique": "search",
      "logicalPlacements": 15,
      "rating": 1944,
      "searchNodes": 927,
      "techniques": {
        "naked-single": 6,
        "hidden-single": 9,
        "locked-candidate": 2,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 42
    },
    "id": "20260829-v1-287",
    "puzzle": "380010002019004000000000000000700000094000150107090800006000030200130000500070200",
    "seed": 287,
    "solution": "385917462719264385462583719823751694694328157157496823976842531248135976531679248"
  },
  {
    "analysis": {
      "candidateEliminations": 9,
      "clueCount": 26,
      "guessBranches": 64,
      "hardestTechnique": "search",
      "logicalPlacements": 9,
      "rating": 1917,
      "searchNodes": 659,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 9,
        "locked-candidate": 3,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 46
    },
    "id": "20260829-v1-679",
    "puzzle": "600030708070900005003000020057090000260500091000002000000100000420000069010050007",
    "seed": 679,
    "solution": "692435718871926435543718926357891642264573891189642573738169254425387169916254387"
  },
  {
    "analysis": {
      "candidateEliminations": 17,
      "clueCount": 25,
      "guessBranches": 61,
      "hardestTechnique": "search",
      "logicalPlacements": 8,
      "rating": 1909,
      "searchNodes": 865,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 8,
        "locked-candidate": 7,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 48
    },
    "id": "20260829-v1-784",
    "puzzle": "050069000081000400000000507004300001100024380000700000400087060020000008000000930",
    "seed": 784,
    "solution": "752469813381572496649831527264398751175624389938715642493187265526943178817256934"
  },
  {
    "analysis": {
      "candidateEliminations": 5,
      "clueCount": 25,
      "guessBranches": 64,
      "hardestTechnique": "search",
      "logicalPlacements": 8,
      "rating": 1906,
      "searchNodes": 602,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 8,
        "locked-candidate": 2,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 48
    },
    "id": "20260829-v1-826",
    "puzzle": "000000310001900007200630080109000000000400000027356000010000730902000600000060008",
    "seed": 826,
    "solution": "498725316361948257275631489149287563536419872827356194614892735982573641753164928"
  },
  {
    "analysis": {
      "candidateEliminations": 13,
      "clueCount": 25,
      "guessBranches": 58,
      "hardestTechnique": "search",
      "logicalPlacements": 5,
      "rating": 1886,
      "searchNodes": 776,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 5,
        "locked-candidate": 4,
        "naked-pair": 1,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 1
      },
      "unresolvedAfterLogic": 51
    },
    "id": "20260829-v1-79",
    "puzzle": "700086100000900405000000000098270050004600000070500008020150003000809010050000000",
    "seed": 79,
    "solution": "745386192386912475912745836698271354534698721271534968829157643463829517157463289"
  },
  {
    "analysis": {
      "candidateEliminations": 14,
      "clueCount": 25,
      "guessBranches": 60,
      "hardestTechnique": "search",
      "logicalPlacements": 5,
      "rating": 1871,
      "searchNodes": 592,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 5,
        "locked-candidate": 3,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 1,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 51
    },
    "id": "20260829-v1-426",
    "puzzle": "200000030140060080000002540000000000004000825508100007000708054009504000000010000",
    "seed": 426,
    "solution": "287451639145369782936872541793285416614937825528146397361798254879524163452613978"
  },
  {
    "analysis": {
      "candidateEliminations": 24,
      "clueCount": 25,
      "guessBranches": 55,
      "hardestTechnique": "search",
      "logicalPlacements": 6,
      "rating": 1798,
      "searchNodes": 978,
      "techniques": {
        "naked-single": 2,
        "hidden-single": 4,
        "locked-candidate": 6,
        "naked-pair": 1,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 50
    },
    "id": "20260829-v1-450",
    "puzzle": "690070000000051008040900007980010050006000071070004000700000030000100009500028000",
    "seed": 450,
    "solution": "698273145327451698145986327983712456456839271271564983714695832832147569569328714"
  },
  {
    "analysis": {
      "candidateEliminations": 17,
      "clueCount": 24,
      "guessBranches": 53,
      "hardestTechnique": "search",
      "logicalPlacements": 5,
      "rating": 1778,
      "searchNodes": 687,
      "techniques": {
        "naked-single": 2,
        "hidden-single": 3,
        "locked-candidate": 3,
        "naked-pair": 1,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 1
      },
      "unresolvedAfterLogic": 52
    },
    "id": "20260829-v1-739",
    "puzzle": "000060000024001607005000031000000090050100008000006400002800700408070005300090000",
    "seed": 739,
    "solution": "183567249924381657765429831241738596659142378837956412592814763418673925376295184"
  },
  {
    "analysis": {
      "candidateEliminations": 3,
      "clueCount": 24,
      "guessBranches": 58,
      "hardestTechnique": "search",
      "logicalPlacements": 2,
      "rating": 1775,
      "searchNodes": 697,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 2,
        "locked-candidate": 2,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 55
    },
    "id": "20260829-v1-674",
    "puzzle": "000057980010403000000000600500008000003070002000002390108000006700005000004700800",
    "seed": 674,
    "solution": "436257981819463527275891643521938764983674152647512398158349276762185439394726815"
  },
  {
    "analysis": {
      "candidateEliminations": 10,
      "clueCount": 25,
      "guessBranches": 56,
      "hardestTechnique": "search",
      "logicalPlacements": 8,
      "rating": 1743,
      "searchNodes": 636,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 8,
        "locked-candidate": 4,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 48
    },
    "id": "20260829-v1-873",
    "puzzle": "000000360000542000010009002030090200080006900005800000020003004690200103000060000",
    "seed": 873,
    "solution": "452187369369542817817639452736495281281376945945821736528713694694258173173964528"
  },
  {
    "analysis": {
      "candidateEliminations": 8,
      "clueCount": 25,
      "guessBranches": 55,
      "hardestTechnique": "search",
      "logicalPlacements": 5,
      "rating": 1715,
      "searchNodes": 659,
      "techniques": {
        "naked-single": 3,
        "hidden-single": 2,
        "locked-candidate": 4,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 51
    },
    "id": "20260829-v1-364",
    "puzzle": "530800009006090000000301600003510000000200007004003051800600000000030200075000900",
    "seed": 364,
    "solution": "531826749286497135947351682793518426158264397624973851812649573469735218375182964"
  },
  {
    "analysis": {
      "candidateEliminations": 9,
      "clueCount": 24,
      "guessBranches": 52,
      "hardestTechnique": "search",
      "logicalPlacements": 12,
      "rating": 1663,
      "searchNodes": 568,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 12,
        "locked-candidate": 4,
        "naked-pair": 1,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 45
    },
    "id": "20260829-v1-544",
    "puzzle": "369000000001702006200000008005607004000020000030800100000000037000096000800300040",
    "seed": 544,
    "solution": "369184275481752396257963418125637984948521763736849152694218537573496821812375649"
  },
  {
    "analysis": {
      "candidateEliminations": 4,
      "clueCount": 26,
      "guessBranches": 53,
      "hardestTechnique": "search",
      "logicalPlacements": 1,
      "rating": 1650,
      "searchNodes": 848,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 1,
        "locked-candidate": 2,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 54
    },
    "id": "20260829-v1-649",
    "puzzle": "014805002080700010000094000009000040030070000002019008060000700090050000308000065",
    "seed": 649,
    "solution": "914865372685723419273194586159386247836472951742519638561238794497651823328947165"
  },
  {
    "analysis": {
      "candidateEliminations": 22,
      "clueCount": 24,
      "guessBranches": 47,
      "hardestTechnique": "search",
      "logicalPlacements": 8,
      "rating": 1649,
      "searchNodes": 437,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 7,
        "locked-candidate": 6,
        "naked-pair": 0,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 1
      },
      "unresolvedAfterLogic": 49
    },
    "id": "20260829-v1-667",
    "puzzle": "000000013020000000301070054090000040000308500700000930008000300500000009002060075",
    "seed": 667,
    "solution": "679524813425183796381976254893657142214398567756412938968745321547231689132869475"
  },
  {
    "analysis": {
      "candidateEliminations": 7,
      "clueCount": 24,
      "guessBranches": 53,
      "hardestTechnique": "search",
      "logicalPlacements": 15,
      "rating": 1646,
      "searchNodes": 814,
      "techniques": {
        "naked-single": 5,
        "hidden-single": 10,
        "locked-candidate": 3,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 42
    },
    "id": "20260829-v1-145",
    "puzzle": "009016000200050081006004070090300750000000006002000010603020090000000000000901008",
    "seed": 145,
    "solution": "759816423234759681816234975198362754547198236362547819683425197971683542425971368"
  },
  {
    "analysis": {
      "candidateEliminations": 29,
      "clueCount": 24,
      "guessBranches": 47,
      "hardestTechnique": "search",
      "logicalPlacements": 5,
      "rating": 1638,
      "searchNodes": 621,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 4,
        "locked-candidate": 7,
        "naked-pair": 3,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 52
    },
    "id": "20260829-v1-537",
    "puzzle": "000070300002000500000518070000040030000801000081007940204000005000600000013080000",
    "seed": 537,
    "solution": "158472369742369518639518472527946831496831257381257946264193785875624193913785624"
  },
  {
    "analysis": {
      "candidateEliminations": 10,
      "clueCount": 24,
      "guessBranches": 46,
      "hardestTechnique": "search",
      "logicalPlacements": 9,
      "rating": 1637,
      "searchNodes": 581,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 9,
        "locked-candidate": 5,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 1,
        "simple-chain": 1
      },
      "unresolvedAfterLogic": 48
    },
    "id": "20260829-v1-295",
    "puzzle": "070000000102008000850090040708004000000000320400610000010000702000040089000002010",
    "seed": 295,
    "solution": "379421658142568973856793241798234165561987324423615897614859732237146589985372416"
  },
  {
    "analysis": {
      "candidateEliminations": 27,
      "clueCount": 25,
      "guessBranches": 46,
      "hardestTechnique": "search",
      "logicalPlacements": 6,
      "rating": 1623,
      "searchNodes": 459,
      "techniques": {
        "naked-single": 2,
        "hidden-single": 4,
        "locked-candidate": 10,
        "naked-pair": 1,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 50
    },
    "id": "20260829-v1-2",
    "puzzle": "005000000800130045319000200200008070000500600753000000000000067030000800000892000",
    "seed": 2,
    "solution": "475286139826139745319745286264918573198573624753624918982351467531467892647892351"
  },
  {
    "analysis": {
      "candidateEliminations": 15,
      "clueCount": 24,
      "guessBranches": 44,
      "hardestTechnique": "search",
      "logicalPlacements": 13,
      "rating": 1584,
      "searchNodes": 623,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 13,
        "locked-candidate": 7,
        "naked-pair": 0,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 1
      },
      "unresolvedAfterLogic": 44
    },
    "id": "20260829-v1-904",
    "puzzle": "600500000430000000008007400050008720000005040000270300920000800000100006507004000",
    "seed": 904,
    "solution": "679543281435821697218967453356418729792635148184279365921756834843192576567384912"
  },
  {
    "analysis": {
      "candidateEliminations": 15,
      "clueCount": 24,
      "guessBranches": 48,
      "hardestTechnique": "search",
      "logicalPlacements": 7,
      "rating": 1577,
      "searchNodes": 622,
      "techniques": {
        "naked-single": 2,
        "hidden-single": 5,
        "locked-candidate": 2,
        "naked-pair": 0,
        "hidden-pair": 2,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 50
    },
    "id": "20260829-v1-70",
    "puzzle": "000690700000004908060000034000002300900000050001400000100050000000006870004780020",
    "seed": 70,
    "solution": "432698715517324968869175234786512349943867152251439687178253496325946871694781523"
  },
  {
    "analysis": {
      "candidateEliminations": 9,
      "clueCount": 24,
      "guessBranches": 49,
      "hardestTechnique": "search",
      "logicalPlacements": 9,
      "rating": 1574,
      "searchNodes": 545,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 9,
        "locked-candidate": 2,
        "naked-pair": 0,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 48
    },
    "id": "20260829-v1-142",
    "puzzle": "000000002000080590700402800403800000050030086007000000036090005800000030000060070",
    "seed": 142,
    "solution": "368957142241683597795412863413876259952134786687529314136798425879245631524361978"
  },
  {
    "analysis": {
      "candidateEliminations": 16,
      "clueCount": 24,
      "guessBranches": 46,
      "hardestTechnique": "search",
      "logicalPlacements": 5,
      "rating": 1574,
      "searchNodes": 641,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 5,
        "locked-candidate": 7,
        "naked-pair": 0,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 52
    },
    "id": "20260829-v1-369",
    "puzzle": "200000301000090008070005000003001000050200000907630000090053000000100906410000800",
    "seed": 369,
    "solution": "249786351531492768678315429863541297154279683927638514796853142385124976412967835"
  },
  {
    "analysis": {
      "candidateEliminations": 25,
      "clueCount": 24,
      "guessBranches": 45,
      "hardestTechnique": "search",
      "logicalPlacements": 6,
      "rating": 1564,
      "searchNodes": 460,
      "techniques": {
        "naked-single": 4,
        "hidden-single": 2,
        "locked-candidate": 6,
        "naked-pair": 3,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 51
    },
    "id": "20260829-v1-883",
    "puzzle": "030000000008000970067400003006001200000040800050200060125009000004000000009680000",
    "seed": 883,
    "solution": "532967481418532976967418523746851239293746815851293764125379648684125397379684152"
  },
  {
    "analysis": {
      "candidateEliminations": 5,
      "clueCount": 26,
      "guessBranches": 47,
      "hardestTechnique": "search",
      "logicalPlacements": 9,
      "rating": 1557,
      "searchNodes": 523,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 8,
        "locked-candidate": 2,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 1
      },
      "unresolvedAfterLogic": 46
    },
    "id": "20260829-v1-24",
    "puzzle": "070089006003000200000506010009107040010800095000000000000600008000920001165000020",
    "seed": 24,
    "solution": "471289536653714289928536714539167842716842395284395167392651478847923651165478923"
  },
  {
    "analysis": {
      "candidateEliminations": 5,
      "clueCount": 27,
      "guessBranches": 49,
      "hardestTechnique": "search",
      "logicalPlacements": 2,
      "rating": 1550,
      "searchNodes": 388,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 2,
        "locked-candidate": 3,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 52
    },
    "id": "20260829-v1-408",
    "puzzle": "000604200000200050300059074004000000709000080580067400830000000000702008000030590",
    "seed": 408,
    "solution": "958674213476213859312859674124385967769421385583967421831596742695742138247138596"
  },
  {
    "analysis": {
      "candidateEliminations": 14,
      "clueCount": 24,
      "guessBranches": 46,
      "hardestTechnique": "search",
      "logicalPlacements": 6,
      "rating": 1547,
      "searchNodes": 597,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 6,
        "locked-candidate": 5,
        "naked-pair": 0,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 51
    },
    "id": "20260829-v1-65",
    "puzzle": "800000050059008030000002007070000000100043000502900004000030040780000021000009080",
    "seed": 65,
    "solution": "817364259259178436436592817374625198198743562562981374921837645783456921645219783"
  },
  {
    "analysis": {
      "candidateEliminations": 21,
      "clueCount": 24,
      "guessBranches": 44,
      "hardestTechnique": "search",
      "logicalPlacements": 7,
      "rating": 1540,
      "searchNodes": 463,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 7,
        "locked-candidate": 5,
        "naked-pair": 1,
        "hidden-pair": 2,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 50
    },
    "id": "20260829-v1-809",
    "puzzle": "020000004000003000003071900084000160507000040000090300000000000009480700070010058",
    "seed": 809,
    "solution": "721968534698543217453271986984357162537126849216894375845732691169485723372619458"
  },
  {
    "analysis": {
      "candidateEliminations": 21,
      "clueCount": 24,
      "guessBranches": 45,
      "hardestTechnique": "search",
      "logicalPlacements": 8,
      "rating": 1534,
      "searchNodes": 448,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 8,
        "locked-candidate": 6,
        "naked-pair": 0,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 49
    },
    "id": "20260829-v1-663",
    "puzzle": "607000050020108046000000000006304002000070300090000005000500030000009001065400009",
    "seed": 663,
    "solution": "647923158329158746851746923576394812218675394493812675982561437734289561165437289"
  },
  {
    "analysis": {
      "candidateEliminations": 5,
      "clueCount": 24,
      "guessBranches": 48,
      "hardestTechnique": "search",
      "logicalPlacements": 15,
      "rating": 1520,
      "searchNodes": 578,
      "techniques": {
        "naked-single": 5,
        "hidden-single": 10,
        "locked-candidate": 3,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 42
    },
    "id": "20260829-v1-857",
    "puzzle": "400850009307000008000003000006700080020060000100040000769002000000080006040007100",
    "seed": 857,
    "solution": "412856739397124568685973241956731482824569317173248695769312854231485976548697123"
  },
  {
    "analysis": {
      "candidateEliminations": 14,
      "clueCount": 24,
      "guessBranches": 45,
      "hardestTechnique": "search",
      "logicalPlacements": 3,
      "rating": 1511,
      "searchNodes": 612,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 3,
        "locked-candidate": 4,
        "naked-pair": 1,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 54
    },
    "id": "20260829-v1-434",
    "puzzle": "000100405002097010000000000000010000007020809043080070026008700000600048500000000",
    "seed": 434,
    "solution": "978163425452897613631245987895716234167324859243589176326458791719632548584971362"
  },
  {
    "analysis": {
      "candidateEliminations": 27,
      "clueCount": 24,
      "guessBranches": 41,
      "hardestTechnique": "search",
      "logicalPlacements": 8,
      "rating": 1502,
      "searchNodes": 485,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 8,
        "locked-candidate": 9,
        "naked-pair": 0,
        "hidden-pair": 2,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 49
    },
    "id": "20260829-v1-832",
    "puzzle": "300951000200000000000000680010007000000000920009300805853000000900620008000030100",
    "seed": 832,
    "solution": "386951742247863591195472683518297436634185927729346815853719264971624358462538179"
  },
  {
    "analysis": {
      "candidateEliminations": 23,
      "clueCount": 25,
      "guessBranches": 43,
      "hardestTechnique": "search",
      "logicalPlacements": 4,
      "rating": 1499,
      "searchNodes": 657,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 3,
        "locked-candidate": 7,
        "naked-pair": 1,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 52
    },
    "id": "20260829-v1-275",
    "puzzle": "000000002060210098030000400002980000010000000000324009000190685000000070586000000",
    "seed": 275,
    "solution": "895746132764213598231859467342981756918675243657324819473192685129568374586437921"
  },
  {
    "analysis": {
      "candidateEliminations": 15,
      "clueCount": 25,
      "guessBranches": 44,
      "hardestTechnique": "search",
      "logicalPlacements": 7,
      "rating": 1490,
      "searchNodes": 635,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 6,
        "locked-candidate": 2,
        "naked-pair": 1,
        "hidden-pair": 0,
        "x-wing": 1,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 49
    },
    "id": "20260829-v1-393",
    "puzzle": "000800000030000002009506800305700024000000000790040000047005003006900200000070150",
    "seed": 393,
    "solution": "562813479831497562479526831315789624624351798798642315247165983156938247983274156"
  },
  {
    "analysis": {
      "candidateEliminations": 20,
      "clueCount": 25,
      "guessBranches": 43,
      "hardestTechnique": "search",
      "logicalPlacements": 11,
      "rating": 1484,
      "searchNodes": 566,
      "techniques": {
        "naked-single": 4,
        "hidden-single": 7,
        "locked-candidate": 7,
        "naked-pair": 0,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 45
    },
    "id": "20260829-v1-794",
    "puzzle": "000057000010603020000900700200000060000092014540000003057009000000241600020000000",
    "seed": 794,
    "solution": "492157386715683429368924751239415867876392514541768293657839142983241675124576938"
  },
  {
    "analysis": {
      "candidateEliminations": 15,
      "clueCount": 25,
      "guessBranches": 44,
      "hardestTechnique": "search",
      "logicalPlacements": 10,
      "rating": 1478,
      "searchNodes": 537,
      "techniques": {
        "naked-single": 3,
        "hidden-single": 7,
        "locked-candidate": 5,
        "naked-pair": 1,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 46
    },
    "id": "20260829-v1-982",
    "puzzle": "000057000000090008570302910000006090002000300800700060000003006140070000005010080",
    "seed": 982,
    "solution": "914857623623491578578362914357246891462189357891735462789523146146978235235614789"
  },
  {
    "analysis": {
      "candidateEliminations": 6,
      "clueCount": 24,
      "guessBranches": 45,
      "hardestTechnique": "search",
      "logicalPlacements": 8,
      "rating": 1471,
      "searchNodes": 758,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 8,
        "locked-candidate": 3,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 49
    },
    "id": "20260829-v1-171",
    "puzzle": "050900000000070003716040000900000004000600010030004002020000031000030080041200009",
    "seed": 171,
    "solution": "453928176298176543716543928962317854584692317137854692825769431679431285341285769"
  },
  {
    "analysis": {
      "candidateEliminations": 20,
      "clueCount": 26,
      "guessBranches": 41,
      "hardestTechnique": "search",
      "logicalPlacements": 4,
      "rating": 1466,
      "searchNodes": 490,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 3,
        "locked-candidate": 6,
        "naked-pair": 1,
        "hidden-pair": 0,
        "x-wing": 1,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 51
    },
    "id": "20260829-v1-744",
    "puzzle": "900802104030000700000006028100050000050008200008004007000690010000000000603080405",
    "seed": 744,
    "solution": "976832154832415769415976328124759683759368241368124597547693812281547936693281475"
  },
  {
    "analysis": {
      "candidateEliminations": 17,
      "clueCount": 24,
      "guessBranches": 40,
      "hardestTechnique": "search",
      "logicalPlacements": 16,
      "rating": 1455,
      "searchNodes": 521,
      "techniques": {
        "naked-single": 3,
        "hidden-single": 13,
        "locked-candidate": 7,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 1
      },
      "unresolvedAfterLogic": 41
    },
    "id": "20260829-v1-483",
    "puzzle": "000004030250700000701090200008900000010000900000507060000075000083600005400080000",
    "seed": 483,
    "solution": "896254731254731896731896254368942517517368942942517368629475183183629475475183629"
  },
  {
    "analysis": {
      "candidateEliminations": 24,
      "clueCount": 24,
      "guessBranches": 35,
      "hardestTechnique": "search",
      "logicalPlacements": 6,
      "rating": 1446,
      "searchNodes": 560,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 6,
        "locked-candidate": 5,
        "naked-pair": 0,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 3,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 51
    },
    "id": "20260829-v1-528",
    "puzzle": "090056070870000300000200000207084000400000000010002900030000040500600009008005030",
    "seed": 528,
    "solution": "194356278872491356653278491267984513489513762315762984736829145541637829928145637"
  },
  {
    "analysis": {
      "candidateEliminations": 12,
      "clueCount": 25,
      "guessBranches": 43,
      "hardestTechnique": "search",
      "logicalPlacements": 10,
      "rating": 1445,
      "searchNodes": 593,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 9,
        "locked-candidate": 4,
        "naked-pair": 1,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 46
    },
    "id": "20260829-v1-472",
    "puzzle": "400000080000000002090003701100090008080000950005820073800401000079000000000760000",
    "seed": 472,
    "solution": "423176589716958432598243761137695248284317956965824173852431697679582314341769825"
  },
  {
    "analysis": {
      "candidateEliminations": 11,
      "clueCount": 24,
      "guessBranches": 43,
      "hardestTechnique": "search",
      "logicalPlacements": 5,
      "rating": 1442,
      "searchNodes": 607,
      "techniques": {
        "naked-single": 2,
        "hidden-single": 3,
        "locked-candidate": 3,
        "naked-pair": 1,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 52
    },
    "id": "20260829-v1-313",
    "puzzle": "000029000004300000200800035000090070070000820900003001005062090010000500807000000",
    "seed": 313,
    "solution": "531629487784351962269874135156298374473516829928743651345162798612987543897435216"
  },
  {
    "analysis": {
      "candidateEliminations": 17,
      "clueCount": 25,
      "guessBranches": 40,
      "hardestTechnique": "search",
      "logicalPlacements": 8,
      "rating": 1427,
      "searchNodes": 662,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 7,
        "locked-candidate": 6,
        "naked-pair": 1,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 48
    },
    "id": "20260829-v1-360",
    "puzzle": "000000008000260900600043170000800300070016000200300006094000600300002480500000000",
    "seed": 360,
    "solution": "439175268751268943682943175165824397973516824248397516894731652317652489526489731"
  },
  {
    "analysis": {
      "candidateEliminations": 17,
      "clueCount": 24,
      "guessBranches": 40,
      "hardestTechnique": "search",
      "logicalPlacements": 6,
      "rating": 1426,
      "searchNodes": 663,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 5,
        "locked-candidate": 4,
        "naked-pair": 1,
        "hidden-pair": 0,
        "x-wing": 1,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 51
    },
    "id": "20260829-v1-380",
    "puzzle": "090042070006000005000000080000460300073000500600010000020604090300190800007000000",
    "seed": 380,
    "solution": "891542673736981245452376189289465317173829564645713928528634791364197852917258436"
  },
  {
    "analysis": {
      "candidateEliminations": 6,
      "clueCount": 24,
      "guessBranches": 41,
      "hardestTechnique": "search",
      "logicalPlacements": 9,
      "rating": 1425,
      "searchNodes": 618,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 8,
        "locked-candidate": 2,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 1
      },
      "unresolvedAfterLogic": 48
    },
    "id": "20260829-v1-62",
    "puzzle": "000000020870002105006000800054109000000000300200405000600200010000090600003008500",
    "seed": 62,
    "solution": "135987426879642135426513879354179268791826354268435791687254913542391687913768542"
  },
  {
    "analysis": {
      "candidateEliminations": 2,
      "clueCount": 24,
      "guessBranches": 43,
      "hardestTechnique": "search",
      "logicalPlacements": 6,
      "rating": 1422,
      "searchNodes": 486,
      "techniques": {
        "naked-single": 5,
        "hidden-single": 1,
        "locked-candidate": 0,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 1,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 51
    },
    "id": "20260829-v1-406",
    "puzzle": "003001802000000600800350047300200006080000300905000000006100000040002000501000009",
    "seed": 406,
    "solution": "653471892174928635829356147317284956482569371965713428296135784748692513531847269"
  },
  {
    "analysis": {
      "candidateEliminations": 7,
      "clueCount": 26,
      "guessBranches": 43,
      "hardestTechnique": "search",
      "logicalPlacements": 8,
      "rating": 1408,
      "searchNodes": 483,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 8,
        "locked-candidate": 3,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 47
    },
    "id": "20260829-v1-696",
    "puzzle": "804035900000010860002000000500000090070006500400000001620000050300050629007000300",
    "seed": 696,
    "solution": "864735912735912864912864735583271496271496583496583271629348157348157629157629348"
  },
  {
    "analysis": {
      "candidateEliminations": 12,
      "clueCount": 25,
      "guessBranches": 38,
      "hardestTechnique": "search",
      "logicalPlacements": 15,
      "rating": 1375,
      "searchNodes": 377,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 14,
        "locked-candidate": 5,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 1
      },
      "unresolvedAfterLogic": 41
    },
    "id": "20260829-v1-178",
    "puzzle": "803000400000600308560200000000800700400000001002940050000025010000000000710409500",
    "seed": 178,
    "solution": "823791465971654328564283179356812794497536281182947653649325817235178946718469532"
  },
  {
    "analysis": {
      "candidateEliminations": 11,
      "clueCount": 25,
      "guessBranches": 39,
      "hardestTechnique": "search",
      "logicalPlacements": 4,
      "rating": 1372,
      "searchNodes": 592,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 3,
        "locked-candidate": 5,
        "naked-pair": 0,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 52
    },
    "id": "20260829-v1-121",
    "puzzle": "000076000000000504230000000000020409070010000300000086006530907543790000000002000",
    "seed": 121,
    "solution": "495176832167283594238459761681325479974618253352947186826534917543791628719862345"
  },
  {
    "analysis": {
      "candidateEliminations": 9,
      "clueCount": 24,
      "guessBranches": 37,
      "hardestTechnique": "search",
      "logicalPlacements": 4,
      "rating": 1362,
      "searchNodes": 470,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 3,
        "locked-candidate": 1,
        "naked-pair": 1,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 1
      },
      "unresolvedAfterLogic": 53
    },
    "id": "20260829-v1-123",
    "puzzle": "000100007001020630400060001800000009000000720073000100590040000100007908006000000",
    "seed": 123,
    "solution": "365189247981724635427563891814372569659418723273956184598241376142637958736895412"
  },
  {
    "analysis": {
      "candidateEliminations": 12,
      "clueCount": 24,
      "guessBranches": 36,
      "hardestTechnique": "search",
      "logicalPlacements": 14,
      "rating": 1348,
      "searchNodes": 298,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 13,
        "locked-candidate": 5,
        "naked-pair": 1,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 1
      },
      "unresolvedAfterLogic": 43
    },
    "id": "20260829-v1-819",
    "puzzle": "019007000500900200030000061007001000090020500000600042800000006001002000060400005",
    "seed": 819,
    "solution": "619237854548916273732845961427581639396724518185693742874159326951362487263478195"
  },
  {
    "analysis": {
      "candidateEliminations": 9,
      "clueCount": 24,
      "guessBranches": 37,
      "hardestTechnique": "search",
      "logicalPlacements": 9,
      "rating": 1311,
      "searchNodes": 576,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 8,
        "locked-candidate": 6,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 48
    },
    "id": "20260829-v1-863",
    "puzzle": "003080000000002148000009007005700000600090002100040530802060003000010400000007000",
    "seed": 863,
    "solution": "273184695956372148481659327395721864648593712127846539812465973739218456564937281"
  },
  {
    "analysis": {
      "candidateEliminations": 13,
      "clueCount": 24,
      "guessBranches": 36,
      "hardestTechnique": "search",
      "logicalPlacements": 10,
      "rating": 1306,
      "searchNodes": 404,
      "techniques": {
        "naked-single": 5,
        "hidden-single": 5,
        "locked-candidate": 3,
        "naked-pair": 0,
        "hidden-pair": 3,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 47
    },
    "id": "20260829-v1-372",
    "puzzle": "001050000006904070000000850000400290090017000500000008030080000002009100000046007",
    "seed": 372,
    "solution": "371658429856924371429173856718465293293817564564392718937581642642739185185246937"
  },
  {
    "analysis": {
      "candidateEliminations": 4,
      "clueCount": 26,
      "guessBranches": 39,
      "hardestTechnique": "search",
      "logicalPlacements": 5,
      "rating": 1302,
      "searchNodes": 488,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 5,
        "locked-candidate": 2,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 50
    },
    "id": "20260829-v1-793",
    "puzzle": "000000020002000504050600713006010000900700030010004207005200000040007008160030000",
    "seed": 793,
    "solution": "371458926692371584458692713726513849984726135513984267835249671249167358167835492"
  },
  {
    "analysis": {
      "candidateEliminations": 19,
      "clueCount": 25,
      "guessBranches": 30,
      "hardestTechnique": "search",
      "logicalPlacements": 9,
      "rating": 1294,
      "searchNodes": 270,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 9,
        "locked-candidate": 4,
        "naked-pair": 0,
        "hidden-pair": 2,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 2
      },
      "unresolvedAfterLogic": 47
    },
    "id": "20260829-v1-210",
    "puzzle": "000130004046000000000000257035006040000002000009753000004000069608045030000000000",
    "seed": 210,
    "solution": "572138694946527318183964257735816942861492573429753186254371869698245731317689425"
  },
  {
    "analysis": {
      "candidateEliminations": 11,
      "clueCount": 25,
      "guessBranches": 37,
      "hardestTechnique": "search",
      "logicalPlacements": 14,
      "rating": 1292,
      "searchNodes": 438,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 13,
        "locked-candidate": 4,
        "naked-pair": 1,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 42
    },
    "id": "20260829-v1-909",
    "puzzle": "000040001500000020010926000000000800070610400459700000000001000007400008946000070",
    "seed": 909,
    "solution": "692345781534187629718926543261594837873612495459738216385271964127469358946853172"
  },
  {
    "analysis": {
      "candidateEliminations": 15,
      "clueCount": 24,
      "guessBranches": 36,
      "hardestTechnique": "search",
      "logicalPlacements": 7,
      "rating": 1290,
      "searchNodes": 277,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 6,
        "locked-candidate": 5,
        "naked-pair": 1,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 50
    },
    "id": "20260829-v1-49",
    "puzzle": "400000670003008000060014000008000000200036080009001500700100000080000900042090005",
    "seed": 49,
    "solution": "415329678923768154867514239178452396254936781639871542796185423581243967342697815"
  },
  {
    "analysis": {
      "candidateEliminations": 9,
      "clueCount": 24,
      "guessBranches": 37,
      "hardestTechnique": "search",
      "logicalPlacements": 10,
      "rating": 1290,
      "searchNodes": 328,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 9,
        "locked-candidate": 5,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 47
    },
    "id": "20260829-v1-502",
    "puzzle": "000000006183000000060027000070003009000000607508000030000370005001000040407508000",
    "seed": 502,
    "solution": "742831596183659274965427318276143859314985627598762431629374185851296743437518962"
  },
  {
    "analysis": {
      "candidateEliminations": 10,
      "clueCount": 25,
      "guessBranches": 36,
      "hardestTechnique": "search",
      "logicalPlacements": 9,
      "rating": 1282,
      "searchNodes": 471,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 8,
        "locked-candidate": 3,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 1,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 47
    },
    "id": "20260829-v1-981",
    "puzzle": "030040060600005000008109000050000076004900002000010000503000001000200050920400607",
    "seed": 981,
    "solution": "235748169619325748478169325152834976384976512796512834543687291867291453921453687"
  },
  {
    "analysis": {
      "candidateEliminations": 22,
      "clueCount": 24,
      "guessBranches": 34,
      "hardestTechnique": "search",
      "logicalPlacements": 3,
      "rating": 1280,
      "searchNodes": 410,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 2,
        "locked-candidate": 5,
        "naked-pair": 1,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 54
    },
    "id": "20260829-v1-10",
    "puzzle": "002010509480000020000000000000000680040000003137600000004750800020000046010900000",
    "seed": 10,
    "solution": "372418569481569327596327418259173684648295173137684295964752831725831946813946752"
  },
  {
    "analysis": {
      "candidateEliminations": 26,
      "clueCount": 24,
      "guessBranches": 26,
      "hardestTechnique": "search",
      "logicalPlacements": 10,
      "rating": 1257,
      "searchNodes": 375,
      "techniques": {
        "naked-single": 4,
        "hidden-single": 6,
        "locked-candidate": 7,
        "naked-pair": 1,
        "hidden-pair": 2,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 2
      },
      "unresolvedAfterLogic": 47
    },
    "id": "20260829-v1-134",
    "puzzle": "508000000063000000070002031057000069000000100000090078090000052000060040000523000",
    "seed": 134,
    "solution": "528316794163947285479852631857231469946785123312694578691478352235169847784523916"
  },
  {
    "analysis": {
      "candidateEliminations": 31,
      "clueCount": 25,
      "guessBranches": 24,
      "hardestTechnique": "search",
      "logicalPlacements": 4,
      "rating": 1252,
      "searchNodes": 390,
      "techniques": {
        "naked-single": 2,
        "hidden-single": 2,
        "locked-candidate": 6,
        "naked-pair": 1,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 3,
        "simple-chain": 1
      },
      "unresolvedAfterLogic": 52
    },
    "id": "20260829-v1-235",
    "puzzle": "040305000002006005000090040109003850004050000000071003900000600007038000800000010",
    "seed": 235,
    "solution": "641385297792146385583297146179463852364852971258971463925714638417638529836529714"
  },
  {
    "analysis": {
      "candidateEliminations": 14,
      "clueCount": 25,
      "guessBranches": 34,
      "hardestTechnique": "search",
      "logicalPlacements": 3,
      "rating": 1251,
      "searchNodes": 410,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 3,
        "locked-candidate": 3,
        "naked-pair": 0,
        "hidden-pair": 2,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 53
    },
    "id": "20260829-v1-612",
    "puzzle": "640009003100020040002050000510070000004000700030200010000038007080000150000400009",
    "seed": 612,
    "solution": "645189273198327546372654891519873462264591738837246915451938627983762154726415389"
  },
  {
    "analysis": {
      "candidateEliminations": 6,
      "clueCount": 25,
      "guessBranches": 36,
      "hardestTechnique": "search",
      "logicalPlacements": 12,
      "rating": 1250,
      "searchNodes": 417,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 12,
        "locked-candidate": 4,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 44
    },
    "id": "20260829-v1-746",
    "puzzle": "035000000000000982920004000004102000000050218000006005500010009010200000700000830",
    "seed": 746,
    "solution": "135829476467531982928764153354182697679453218281976345546318729813297564792645831"
  },
  {
    "analysis": {
      "candidateEliminations": 11,
      "clueCount": 24,
      "guessBranches": 35,
      "hardestTechnique": "search",
      "logicalPlacements": 7,
      "rating": 1250,
      "searchNodes": 477,
      "techniques": {
        "naked-single": 2,
        "hidden-single": 5,
        "locked-candidate": 5,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 50
    },
    "id": "20260829-v1-870",
    "puzzle": "040900005030000270006740800000800007000003000015000020080500900060009100400000006",
    "seed": 870,
    "solution": "742938615938156274156742893293815467674293581815674329381567942567429138429381756"
  },
  {
    "analysis": {
      "candidateEliminations": 10,
      "clueCount": 24,
      "guessBranches": 36,
      "hardestTechnique": "search",
      "logicalPlacements": 14,
      "rating": 1249,
      "searchNodes": 490,
      "techniques": {
        "naked-single": 9,
        "hidden-single": 5,
        "locked-candidate": 3,
        "naked-pair": 0,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 43
    },
    "id": "20260829-v1-433",
    "puzzle": "000200400000050001000009080006000090005001040020593070080005020007400500100700000",
    "seed": 433,
    "solution": "691287453872354961543169782716842395935671248428593176384915627267438519159726834"
  },
  {
    "analysis": {
      "candidateEliminations": 9,
      "clueCount": 25,
      "guessBranches": 34,
      "hardestTechnique": "search",
      "logicalPlacements": 10,
      "rating": 1232,
      "searchNodes": 545,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 9,
        "locked-candidate": 6,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 46
    },
    "id": "20260829-v1-184",
    "puzzle": "007000600000860000060030054500900000983002400000000830050000700001270000000008013",
    "seed": 184,
    "solution": "137425698425869371869137254546983127983712465712546839658391742391274586274658913"
  },
  {
    "analysis": {
      "candidateEliminations": 14,
      "clueCount": 24,
      "guessBranches": 34,
      "hardestTechnique": "search",
      "logicalPlacements": 5,
      "rating": 1221,
      "searchNodes": 473,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 4,
        "locked-candidate": 4,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 52
    },
    "id": "20260829-v1-283",
    "puzzle": "090000000001000004207000135000000001040800006009310057004000000800207000070036000",
    "seed": 283,
    "solution": "496153782531728694287649135758962341143875926629314857364581279815297463972436518"
  },
  {
    "analysis": {
      "candidateEliminations": 24,
      "clueCount": 25,
      "guessBranches": 30,
      "hardestTechnique": "search",
      "logicalPlacements": 3,
      "rating": 1209,
      "searchNodes": 488,
      "techniques": {
        "naked-single": 2,
        "hidden-single": 1,
        "locked-candidate": 7,
        "naked-pair": 0,
        "hidden-pair": 2,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 53
    },
    "id": "20260829-v1-221",
    "puzzle": "000010000207004000910750006000047001003000080000020470004900800000075000369000000",
    "seed": 221,
    "solution": "436819527257634198918752346825347961743196285691528473574963812182475639369281754"
  },
  {
    "analysis": {
      "candidateEliminations": 4,
      "clueCount": 24,
      "guessBranches": 35,
      "hardestTechnique": "search",
      "logicalPlacements": 9,
      "rating": 1209,
      "searchNodes": 522,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 8,
        "locked-candidate": 2,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 48
    },
    "id": "20260829-v1-867",
    "puzzle": "830050002600709080020000100080060010000207006003000000000000000000003907016005020",
    "seed": 867,
    "solution": "834156792651729483927438165782364519195287346463591278579842631248613957316975824"
  },
  {
    "analysis": {
      "candidateEliminations": 14,
      "clueCount": 26,
      "guessBranches": 33,
      "hardestTechnique": "search",
      "logicalPlacements": 16,
      "rating": 1207,
      "searchNodes": 426,
      "techniques": {
        "naked-single": 2,
        "hidden-single": 14,
        "locked-candidate": 7,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 39
    },
    "id": "20260829-v1-749",
    "puzzle": "030002187000108040000060020000210000080006000000007065800040000260001700070005010",
    "seed": 749,
    "solution": "634592187952178346718364529546219873387456291129837465891743652265981734473625918"
  },
  {
    "analysis": {
      "candidateEliminations": 15,
      "clueCount": 24,
      "guessBranches": 31,
      "hardestTechnique": "search",
      "logicalPlacements": 10,
      "rating": 1174,
      "searchNodes": 502,
      "techniques": {
        "naked-single": 3,
        "hidden-single": 7,
        "locked-candidate": 5,
        "naked-pair": 0,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 47
    },
    "id": "20260829-v1-159",
    "puzzle": "079000005850000300000280060300000000041500000000706120000009603100400000000003050",
    "seed": 159,
    "solution": "679341285852967341413285967367124598241598736985736124524879613136452879798613452"
  },
  {
    "analysis": {
      "candidateEliminations": 23,
      "clueCount": 26,
      "guessBranches": 28,
      "hardestTechnique": "search",
      "logicalPlacements": 7,
      "rating": 1173,
      "searchNodes": 199,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 7,
        "locked-candidate": 6,
        "naked-pair": 1,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 1
      },
      "unresolvedAfterLogic": 48
    },
    "id": "20260829-v1-156",
    "puzzle": "010000000005064000000007358000070006150608000803040000500400027048020003000000600",
    "seed": 156,
    "solution": "719853462385264791426197358294571836157638249863942175531486927648729513972315684"
  },
  {
    "analysis": {
      "candidateEliminations": 11,
      "clueCount": 24,
      "guessBranches": 30,
      "hardestTechnique": "search",
      "logicalPlacements": 10,
      "rating": 1171,
      "searchNodes": 362,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 10,
        "locked-candidate": 3,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 1
      },
      "unresolvedAfterLogic": 47
    },
    "id": "20260829-v1-583",
    "puzzle": "000140008500200940009000700300070200050600000900001805800005009070010000006000000",
    "seed": 583,
    "solution": "627149358583267941419853762341578296758692134962431875834725619275916483196384527"
  },
  {
    "analysis": {
      "candidateEliminations": 7,
      "clueCount": 24,
      "guessBranches": 33,
      "hardestTechnique": "search",
      "logicalPlacements": 12,
      "rating": 1169,
      "searchNodes": 340,
      "techniques": {
        "naked-single": 6,
        "hidden-single": 6,
        "locked-candidate": 4,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 45
    },
    "id": "20260829-v1-297",
    "puzzle": "040000000000800203705002000200006000170350000038000600000100056000003010009060008",
    "seed": 297,
    "solution": "342691587961875243785432169294716835176358492538924671823149756657283914419567328"
  },
  {
    "analysis": {
      "candidateEliminations": 6,
      "clueCount": 24,
      "guessBranches": 33,
      "hardestTechnique": "search",
      "logicalPlacements": 14,
      "rating": 1167,
      "searchNodes": 344,
      "techniques": {
        "naked-single": 4,
        "hidden-single": 10,
        "locked-candidate": 2,
        "naked-pair": 0,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 43
    },
    "id": "20260829-v1-964",
    "puzzle": "000400150070010800000002040040090030809020700000000005000703000004000000006001528",
    "seed": 964,
    "solution": "628437159473519862591682347147895236859326714362174985285763491914258673736941528"
  },
  {
    "analysis": {
      "candidateEliminations": 8,
      "clueCount": 24,
      "guessBranches": 33,
      "hardestTechnique": "search",
      "logicalPlacements": 10,
      "rating": 1165,
      "searchNodes": 447,
      "techniques": {
        "naked-single": 2,
        "hidden-single": 8,
        "locked-candidate": 1,
        "naked-pair": 1,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 47
    },
    "id": "20260829-v1-910",
    "puzzle": "000102030005000007000040068600507400000030000090060700500800600903000000076000009",
    "seed": 910,
    "solution": "869172534435689217712345968628517493157934826394268751541893672983726145276451389"
  },
  {
    "analysis": {
      "candidateEliminations": 29,
      "clueCount": 24,
      "guessBranches": 27,
      "hardestTechnique": "search",
      "logicalPlacements": 8,
      "rating": 1161,
      "searchNodes": 484,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 7,
        "locked-candidate": 9,
        "naked-pair": 1,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 49
    },
    "id": "20260829-v1-129",
    "puzzle": "090000020000006001006030500800200000600010004000704209400003000017800090003100000",
    "seed": 129,
    "solution": "391578426758426931246931578874269315629315784135784269482693157517842693963157842"
  },
  {
    "analysis": {
      "candidateEliminations": 13,
      "clueCount": 26,
      "guessBranches": 29,
      "hardestTechnique": "search",
      "logicalPlacements": 9,
      "rating": 1160,
      "searchNodes": 273,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 9,
        "locked-candidate": 5,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 1
      },
      "unresolvedAfterLogic": 46
    },
    "id": "20260829-v1-19",
    "puzzle": "000030000500007040004000609205609800000000750080070006016800020702000008050090000",
    "seed": 19,
    "solution": "967134285528967341134528679275649813649381752381275496416853927792416538853792164"
  },
  {
    "analysis": {
      "candidateEliminations": 8,
      "clueCount": 25,
      "guessBranches": 29,
      "hardestTechnique": "search",
      "logicalPlacements": 18,
      "rating": 1156,
      "searchNodes": 434,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 18,
        "locked-candidate": 5,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 1
      },
      "unresolvedAfterLogic": 38
    },
    "id": "20260829-v1-417",
    "puzzle": "070504006500000100000000080010340600700002500045000000000000701050160004007020300",
    "seed": 417,
    "solution": "271584936584639172639271485812345697796812543345796218428953761953167824167428359"
  },
  {
    "analysis": {
      "candidateEliminations": 12,
      "clueCount": 25,
      "guessBranches": 32,
      "hardestTechnique": "search",
      "logicalPlacements": 11,
      "rating": 1152,
      "searchNodes": 425,
      "techniques": {
        "naked-single": 4,
        "hidden-single": 7,
        "locked-candidate": 4,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 45
    },
    "id": "20260829-v1-641",
    "puzzle": "000701000000260000780090300010600280004000700000000065000570034070006000006000950",
    "seed": 641,
    "solution": "263781549495263178781495326917654283654832791832917465128579634579346812346128957"
  },
  {
    "analysis": {
      "candidateEliminations": 12,
      "clueCount": 26,
      "guessBranches": 31,
      "hardestTechnique": "search",
      "logicalPlacements": 9,
      "rating": 1149,
      "searchNodes": 307,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 9,
        "locked-candidate": 2,
        "naked-pair": 0,
        "hidden-pair": 2,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 46
    },
    "id": "20260829-v1-352",
    "puzzle": "070000006000050004000386050040600030300070001061008000400060003089500100200000800",
    "seed": 352,
    "solution": "572914386836752914194386752745691238328475691961238475417869523689523147253147869"
  },
  {
    "analysis": {
      "candidateEliminations": 7,
      "clueCount": 24,
      "guessBranches": 32,
      "hardestTechnique": "search",
      "logicalPlacements": 13,
      "rating": 1146,
      "searchNodes": 476,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 12,
        "locked-candidate": 3,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 44
    },
    "id": "20260829-v1-940",
    "puzzle": "004000305230000600000005090010000000752640000600008070000090003580007000000000047",
    "seed": 940,
    "solution": "974861325235974681861235794318752469752649138649318572427196853583427916196583247"
  },
  {
    "analysis": {
      "candidateEliminations": 13,
      "clueCount": 26,
      "guessBranches": 31,
      "hardestTechnique": "search",
      "logicalPlacements": 8,
      "rating": 1142,
      "searchNodes": 382,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 7,
        "locked-candidate": 3,
        "naked-pair": 0,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 47
    },
    "id": "20260829-v1-462",
    "puzzle": "000050937400007000003100000002340809000001000000009520306098005000400000000000298",
    "seed": 462,
    "solution": "218654937465937182793182654152346879987521346634879521376298415829415763541763298"
  },
  {
    "analysis": {
      "candidateEliminations": 7,
      "clueCount": 25,
      "guessBranches": 31,
      "hardestTechnique": "search",
      "logicalPlacements": 6,
      "rating": 1139,
      "searchNodes": 459,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 6,
        "locked-candidate": 4,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 50
    },
    "id": "20260829-v1-938",
    "puzzle": "492007300000060000650000800904003000730000080000000107000020900040001063000706000",
    "seed": 938,
    "solution": "492817356178365294653249871984173625731652489526498137367524918245981763819736542"
  },
  {
    "analysis": {
      "candidateEliminations": 13,
      "clueCount": 25,
      "guessBranches": 30,
      "hardestTechnique": "search",
      "logicalPlacements": 4,
      "rating": 1138,
      "searchNodes": 391,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 4,
        "locked-candidate": 4,
        "naked-pair": 1,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 52
    },
    "id": "20260829-v1-485",
    "puzzle": "000000460702000900860000017005100030030000004080690000000014006000800000690300700",
    "seed": 485,
    "solution": "359271468712486953864935217275148639936527184481693572523714896147869325698352741"
  },
  {
    "analysis": {
      "candidateEliminations": 1,
      "clueCount": 24,
      "guessBranches": 30,
      "hardestTechnique": "search",
      "logicalPlacements": 5,
      "rating": 1137,
      "searchNodes": 485,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 5,
        "locked-candidate": 0,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 1
      },
      "unresolvedAfterLogic": 52
    },
    "id": "20260829-v1-341",
    "puzzle": "900030000002010600030002005800020000050070009100306070503008040068000000000000700",
    "seed": 341,
    "solution": "915637482482915637637482915874129356356874129129356874593768241768241593241593768"
  },
  {
    "analysis": {
      "candidateEliminations": 12,
      "clueCount": 24,
      "guessBranches": 30,
      "hardestTechnique": "search",
      "logicalPlacements": 8,
      "rating": 1130,
      "searchNodes": 353,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 8,
        "locked-candidate": 5,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 49
    },
    "id": "20260829-v1-601",
    "puzzle": "040600700600890000000020130080000040007000009304008500000002004000060000728003000",
    "seed": 601,
    "solution": "542631798613897425879524136981275643257346819364918572196782354435169287728453961"
  },
  {
    "analysis": {
      "candidateEliminations": 3,
      "clueCount": 27,
      "guessBranches": 32,
      "hardestTechnique": "search",
      "logicalPlacements": 3,
      "rating": 1129,
      "searchNodes": 432,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 3,
        "locked-candidate": 2,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 51
    },
    "id": "20260829-v1-415",
    "puzzle": "000001900400978350000000004000107800080030000607000040823400790000000005000009208",
    "seed": 415,
    "solution": "235641987461978352798325614354167829982534176617892543823456791179283465546719238"
  },
  {
    "analysis": {
      "candidateEliminations": 12,
      "clueCount": 25,
      "guessBranches": 27,
      "hardestTechnique": "search",
      "logicalPlacements": 2,
      "rating": 1125,
      "searchNodes": 319,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 2,
        "locked-candidate": 3,
        "naked-pair": 0,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 1
      },
      "unresolvedAfterLogic": 54
    },
    "id": "20260829-v1-204",
    "puzzle": "000060000052308100107000000400001007080500030509000000004000750000090063000700209",
    "seed": 204,
    "solution": "348167925952348176167952384423681597681579432579423618294836751715294863836715249"
  },
  {
    "analysis": {
      "candidateEliminations": 17,
      "clueCount": 25,
      "guessBranches": 26,
      "hardestTechnique": "search",
      "logicalPlacements": 9,
      "rating": 1118,
      "searchNodes": 427,
      "techniques": {
        "naked-single": 2,
        "hidden-single": 7,
        "locked-candidate": 8,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 1,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 47
    },
    "id": "20260829-v1-253",
    "puzzle": "000060001304000006009000270900400000200081000035006000000007860600103004040020000",
    "seed": 253,
    "solution": "752869431314752986869314275981435627276981543435276198193547862628193754547628319"
  },
  {
    "analysis": {
      "candidateEliminations": 6,
      "clueCount": 26,
      "guessBranches": 31,
      "hardestTechnique": "search",
      "logicalPlacements": 8,
      "rating": 1117,
      "searchNodes": 399,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 8,
        "locked-candidate": 3,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 47
    },
    "id": "20260829-v1-97",
    "puzzle": "080000000000005068105000702000600040009048071030102050201006000000780000000001004",
    "seed": 97,
    "solution": "684237519327915468195864732712659843569348271438172956251496387946783125873521694"
  },
  {
    "analysis": {
      "candidateEliminations": 7,
      "clueCount": 27,
      "guessBranches": 30,
      "hardestTechnique": "search",
      "logicalPlacements": 6,
      "rating": 1108,
      "searchNodes": 410,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 5,
        "locked-candidate": 3,
        "naked-pair": 1,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 48
    },
    "id": "20260829-v1-611",
    "puzzle": "009010000007904100800062000000000080034006005000090001700600400040000209900043017",
    "seed": 611,
    "solution": "459318672267954138813762594592431786134876925678295341781629453345187269926543817"
  },
  {
    "analysis": {
      "candidateEliminations": 11,
      "clueCount": 25,
      "guessBranches": 29,
      "hardestTechnique": "search",
      "logicalPlacements": 7,
      "rating": 1106,
      "searchNodes": 488,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 7,
        "locked-candidate": 5,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 49
    },
    "id": "20260829-v1-339",
    "puzzle": "000000050002010900869002040000780395006000020050000000320100000605004000008090000",
    "seed": 339,
    "solution": "417869253532417986869532741241786395786953124953241678324178569695324817178695432"
  },
  {
    "analysis": {
      "candidateEliminations": 17,
      "clueCount": 25,
      "guessBranches": 28,
      "hardestTechnique": "search",
      "logicalPlacements": 7,
      "rating": 1104,
      "searchNodes": 487,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 7,
        "locked-candidate": 5,
        "naked-pair": 1,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 49
    },
    "id": "20260829-v1-889",
    "puzzle": "003000900000087300000061052100020509790000004006000000300100090002008100060090000",
    "seed": 889,
    "solution": "613452987524987361879361452138624579795813624246579813387146295952738146461295738"
  },
  {
    "analysis": {
      "candidateEliminations": 33,
      "clueCount": 25,
      "guessBranches": 17,
      "hardestTechnique": "search",
      "logicalPlacements": 5,
      "rating": 1101,
      "searchNodes": 180,
      "techniques": {
        "naked-single": 3,
        "hidden-single": 2,
        "locked-candidate": 12,
        "naked-pair": 1,
        "hidden-pair": 2,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 2
      },
      "unresolvedAfterLogic": 51
    },
    "id": "20260829-v1-672",
    "puzzle": "000010006030962000000000340805000069000200700000490050000500000010020037703000080",
    "seed": 672,
    "solution": "587314926134962875692857341825731469946285713371496258268573194419628537753149682"
  },
  {
    "analysis": {
      "candidateEliminations": 9,
      "clueCount": 25,
      "guessBranches": 30,
      "hardestTechnique": "search",
      "logicalPlacements": 12,
      "rating": 1097,
      "searchNodes": 382,
      "techniques": {
        "naked-single": 5,
        "hidden-single": 7,
        "locked-candidate": 4,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 44
    },
    "id": "20260829-v1-115",
    "puzzle": "070000000306008050400306070000180004004000109080020500091007000000230001000000800",
    "seed": 115,
    "solution": "978452316316978452452316978563189724724563189189724563691847235847235691235691847"
  },
  {
    "analysis": {
      "candidateEliminations": 10,
      "clueCount": 24,
      "guessBranches": 29,
      "hardestTechnique": "search",
      "logicalPlacements": 5,
      "rating": 1093,
      "searchNodes": 381,
      "techniques": {
        "naked-single": 2,
        "hidden-single": 3,
        "locked-candidate": 4,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 52
    },
    "id": "20260829-v1-840",
    "puzzle": "050000040000940070020005100000000001000050409810030020070008300006010000000207060",
    "seed": 840,
    "solution": "657183942138942675924675183493726851762851439815439726279568314586314297341297568"
  },
  {
    "analysis": {
      "candidateEliminations": 41,
      "clueCount": 25,
      "guessBranches": 22,
      "hardestTechnique": "search",
      "logicalPlacements": 7,
      "rating": 1091,
      "searchNodes": 186,
      "techniques": {
        "naked-single": 4,
        "hidden-single": 3,
        "locked-candidate": 9,
        "naked-pair": 2,
        "hidden-pair": 3,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 49
    },
    "id": "20260829-v1-174",
    "puzzle": "003000000040050060800609400014070600000000154200000000006010300900402070700080000",
    "seed": 174,
    "solution": "693124785142857963875639412514378629387296154269541837426715398938462571751983246"
  },
  {
    "analysis": {
      "candidateEliminations": 13,
      "clueCount": 24,
      "guessBranches": 28,
      "hardestTechnique": "search",
      "logicalPlacements": 9,
      "rating": 1084,
      "searchNodes": 306,
      "techniques": {
        "naked-single": 3,
        "hidden-single": 6,
        "locked-candidate": 4,
        "naked-pair": 0,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 48
    },
    "id": "20260829-v1-421",
    "puzzle": "000000010084109000005300804003070520047000000200800000602000000000000308030500100",
    "seed": 421,
    "solution": "326748915784159236195362874863974521947215683251836497612483759579621348438597162"
  },
  {
    "analysis": {
      "candidateEliminations": 29,
      "clueCount": 25,
      "guessBranches": 25,
      "hardestTechnique": "search",
      "logicalPlacements": 8,
      "rating": 1080,
      "searchNodes": 383,
      "techniques": {
        "naked-single": 3,
        "hidden-single": 5,
        "locked-candidate": 9,
        "naked-pair": 1,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 48
    },
    "id": "20260829-v1-969",
    "puzzle": "012900600500010030000000200100300000000075460800064020008600000200000050600043000",
    "seed": 969,
    "solution": "412937685586412739937586214164329578329875461875164923798651342243798156651243897"
  },
  {
    "analysis": {
      "candidateEliminations": 6,
      "clueCount": 25,
      "guessBranches": 29,
      "hardestTechnique": "search",
      "logicalPlacements": 6,
      "rating": 1076,
      "searchNodes": 389,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 6,
        "locked-candidate": 3,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 50
    },
    "id": "20260829-v1-84",
    "puzzle": "000093004001600000200000070806000439030800250002000000500308000300067900000000040",
    "seed": 84,
    "solution": "675293184481675392293481576816752439934816257752934618529348761348167925167529843"
  },
  {
    "analysis": {
      "candidateEliminations": 30,
      "clueCount": 24,
      "guessBranches": 23,
      "hardestTechnique": "search",
      "logicalPlacements": 9,
      "rating": 1075,
      "searchNodes": 314,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 8,
        "locked-candidate": 10,
        "naked-pair": 0,
        "hidden-pair": 2,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 48
    },
    "id": "20260829-v1-624",
    "puzzle": "000024700671000900000001030000840090405000000120000000008000065012000009000490000",
    "seed": 624,
    "solution": "853924716671583942294761538367845291485219673129637854948172365712356489536498127"
  },
  {
    "analysis": {
      "candidateEliminations": 10,
      "clueCount": 25,
      "guessBranches": 27,
      "hardestTechnique": "search",
      "logicalPlacements": 19,
      "rating": 1073,
      "searchNodes": 283,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 19,
        "locked-candidate": 5,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 1,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 37
    },
    "id": "20260829-v1-584",
    "puzzle": "000020000900030001721005040360000000057000120000000009500090400000103700003072000",
    "seed": 584,
    "solution": "436721895985436271721985346369214587857369124214857639572698413698143752143572968"
  },
  {
    "analysis": {
      "candidateEliminations": 11,
      "clueCount": 24,
      "guessBranches": 27,
      "hardestTechnique": "search",
      "logicalPlacements": 4,
      "rating": 1069,
      "searchNodes": 380,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 4,
        "locked-candidate": 4,
        "naked-pair": 1,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 53
    },
    "id": "20260829-v1-724",
    "puzzle": "000004700000300096708000002840700000000005030012000000201540000000010000300076009",
    "seed": 724,
    "solution": "169254783425387196738691452843769521976125834512438967291543678687912345354876219"
  },
  {
    "analysis": {
      "candidateEliminations": 1,
      "clueCount": 28,
      "guessBranches": 31,
      "hardestTechnique": "search",
      "logicalPlacements": 12,
      "rating": 1068,
      "searchNodes": 431,
      "techniques": {
        "naked-single": 4,
        "hidden-single": 8,
        "locked-candidate": 1,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 41
    },
    "id": "20260829-v1-269",
    "puzzle": "080040190006020500000000034009008000040260001620019000000090008000102700050680200",
    "seed": 269,
    "solution": "785346192436921587291875634179458326548263971623719845312597468864132759957684213"
  },
  {
    "analysis": {
      "candidateEliminations": 4,
      "clueCount": 24,
      "guessBranches": 29,
      "hardestTechnique": "search",
      "logicalPlacements": 17,
      "rating": 1064,
      "searchNodes": 405,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 16,
        "locked-candidate": 3,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 40
    },
    "id": "20260829-v1-400",
    "puzzle": "072000000300000980000006001000200039000003710006000002024800006090600420001000000",
    "seed": 400,
    "solution": "172498563365127984489356271517284639248963715936571842724839156893615427651742398"
  },
  {
    "analysis": {
      "candidateEliminations": 38,
      "clueCount": 24,
      "guessBranches": 21,
      "hardestTechnique": "search",
      "logicalPlacements": 7,
      "rating": 1057,
      "searchNodes": 239,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 6,
        "locked-candidate": 12,
        "naked-pair": 0,
        "hidden-pair": 2,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 50
    },
    "id": "20260829-v1-803",
    "puzzle": "000000250000000007786005009060000305000030904510000020105000000000083000030009006",
    "seed": 803,
    "solution": "941768253352914687786325149469872315827531964513496728195647832674283591238159476"
  },
  {
    "analysis": {
      "candidateEliminations": 16,
      "clueCount": 24,
      "guessBranches": 26,
      "hardestTechnique": "search",
      "logicalPlacements": 9,
      "rating": 1057,
      "searchNodes": 324,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 9,
        "locked-candidate": 5,
        "naked-pair": 0,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 48
    },
    "id": "20260829-v1-845",
    "puzzle": "405000302000004680070000000100087900058000003000300070540000000000070000000913700",
    "seed": 845,
    "solution": "415768392923154687876239541134587926758692413269341875547826139391475268682913754"
  },
  {
    "analysis": {
      "candidateEliminations": 24,
      "clueCount": 24,
      "guessBranches": 24,
      "hardestTechnique": "search",
      "logicalPlacements": 15,
      "rating": 1055,
      "searchNodes": 294,
      "techniques": {
        "naked-single": 3,
        "hidden-single": 12,
        "locked-candidate": 8,
        "naked-pair": 1,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 42
    },
    "id": "20260829-v1-690",
    "puzzle": "030000059000000300020407060008000000000001608103069500300000000096000100000002405",
    "seed": 690,
    "solution": "734186259681925374529437861968254713452371698173869542345718926296543187817692435"
  },
  {
    "analysis": {
      "candidateEliminations": 0,
      "clueCount": 26,
      "guessBranches": 30,
      "hardestTechnique": "search",
      "logicalPlacements": 6,
      "rating": 1053,
      "searchNodes": 364,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 6,
        "locked-candidate": 0,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 49
    },
    "id": "20260829-v1-550",
    "puzzle": "000096040070040001000200700001007000000905002093410000000000024002070609900300008",
    "seed": 550,
    "solution": "128796543679543281354281796241867935786935412593412867817659324432178659965324178"
  },
  {
    "analysis": {
      "candidateEliminations": 17,
      "clueCount": 25,
      "guessBranches": 26,
      "hardestTechnique": "search",
      "logicalPlacements": 5,
      "rating": 1051,
      "searchNodes": 232,
      "techniques": {
        "naked-single": 2,
        "hidden-single": 3,
        "locked-candidate": 7,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 51
    },
    "id": "20260829-v1-665",
    "puzzle": "800520000043080000000000010006005003790000060000200007602000004008702300009140000",
    "seed": 665,
    "solution": "861527439943681572257493618126975843795834261384216957672359184418762395539148726"
  },
  {
    "analysis": {
      "candidateEliminations": 28,
      "clueCount": 25,
      "guessBranches": 19,
      "hardestTechnique": "search",
      "logicalPlacements": 16,
      "rating": 1048,
      "searchNodes": 214,
      "techniques": {
        "naked-single": 4,
        "hidden-single": 12,
        "locked-candidate": 8,
        "naked-pair": 2,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 2,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 40
    },
    "id": "20260829-v1-4",
    "puzzle": "706300000400000020000940507060000003500108000300000070040700800009020000200013700",
    "seed": 4,
    "solution": "756382914491576328832941567964257183527138649318694275143769852679825431285413796"
  },
  {
    "analysis": {
      "candidateEliminations": 20,
      "clueCount": 24,
      "guessBranches": 25,
      "hardestTechnique": "search",
      "logicalPlacements": 12,
      "rating": 1046,
      "searchNodes": 444,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 11,
        "locked-candidate": 6,
        "naked-pair": 0,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 45
    },
    "id": "20260829-v1-136",
    "puzzle": "000740000985002000030050000500007000102000086000000120000004000300060204007300001",
    "seed": 136,
    "solution": "621743958985612743734958612568127439172439586493586127816274395359861274247395861"
  },
  {
    "analysis": {
      "candidateEliminations": 9,
      "clueCount": 24,
      "guessBranches": 27,
      "hardestTechnique": "search",
      "logicalPlacements": 4,
      "rating": 1045,
      "searchNodes": 277,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 4,
        "locked-candidate": 4,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 53
    },
    "id": "20260829-v1-651",
    "puzzle": "040000302000540000070002009004057080000000900007680000100000000025700003090060005",
    "seed": 651,
    "solution": "549876312312549876876312549234957681681234957957681234163425798425798163798163425"
  },
  {
    "analysis": {
      "candidateEliminations": 16,
      "clueCount": 26,
      "guessBranches": 26,
      "hardestTechnique": "search",
      "logicalPlacements": 12,
      "rating": 1029,
      "searchNodes": 357,
      "techniques": {
        "naked-single": 3,
        "hidden-single": 9,
        "locked-candidate": 6,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 43
    },
    "id": "20260829-v1-176",
    "puzzle": "010709000045030600000000300720400000500006700001900000000308000480010005106005030",
    "seed": 176,
    "solution": "318769254245831679697524381729453816534186792861972543952348167483617925176295438"
  },
  {
    "analysis": {
      "candidateEliminations": 36,
      "clueCount": 24,
      "guessBranches": 14,
      "hardestTechnique": "search",
      "logicalPlacements": 8,
      "rating": 1029,
      "searchNodes": 255,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 7,
        "locked-candidate": 9,
        "naked-pair": 2,
        "hidden-pair": 3,
        "x-wing": 0,
        "xy-wing": 1,
        "simple-chain": 1
      },
      "unresolvedAfterLogic": 49
    },
    "id": "20260829-v1-241",
    "puzzle": "000014023700000005008090000300571000010420609000000050000007410900000000020030000",
    "seed": 241,
    "solution": "659714823741283965238695174396571248517428639482369751863957412975142386124836597"
  },
  {
    "analysis": {
      "candidateEliminations": 23,
      "clueCount": 25,
      "guessBranches": 20,
      "hardestTechnique": "search",
      "logicalPlacements": 5,
      "rating": 1028,
      "searchNodes": 324,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 5,
        "locked-candidate": 4,
        "naked-pair": 3,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 1
      },
      "unresolvedAfterLogic": 51
    },
    "id": "20260829-v1-613",
    "puzzle": "807090030023060000405001000000003890700000060000980400030400502000006000000050080",
    "seed": 613,
    "solution": "867594231123768954495321678542613897789245163316987425638479512251836749974152386"
  },
  {
    "analysis": {
      "candidateEliminations": 12,
      "clueCount": 27,
      "guessBranches": 19,
      "hardestTechnique": "search",
      "logicalPlacements": 20,
      "rating": 1025,
      "searchNodes": 366,
      "techniques": {
        "naked-single": 6,
        "hidden-single": 14,
        "locked-candidate": 4,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 2,
        "xy-wing": 0,
        "simple-chain": 2
      },
      "unresolvedAfterLogic": 34
    },
    "id": "20260829-v1-499",
    "puzzle": "000000900001070405070485001000710830006000000030004700000100060040060008007500140",
    "seed": 499,
    "solution": "485621973621973485973485621254716839716839254839254716598142367142367598367598142"
  },
  {
    "analysis": {
      "candidateEliminations": 8,
      "clueCount": 24,
      "guessBranches": 25,
      "hardestTechnique": "search",
      "logicalPlacements": 15,
      "rating": 1023,
      "searchNodes": 362,
      "techniques": {
        "naked-single": 1,
        "hidden-single": 14,
        "locked-candidate": 4,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 1,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 42
    },
    "id": "20260829-v1-470",
    "puzzle": "105080000042000050000013800003008000080627900200000000000009300058000000600000072",
    "seed": 470,
    "solution": "135284796842976153769513824913458267584627931276391548427169385358742619691835472"
  },
  {
    "analysis": {
      "candidateEliminations": 12,
      "clueCount": 24,
      "guessBranches": 25,
      "hardestTechnique": "search",
      "logicalPlacements": 13,
      "rating": 1018,
      "searchNodes": 347,
      "techniques": {
        "naked-single": 4,
        "hidden-single": 9,
        "locked-candidate": 5,
        "naked-pair": 0,
        "hidden-pair": 1,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 44
    },
    "id": "20260829-v1-801",
    "puzzle": "090601703400700000000000010009004000000050020530060140100080050070000200003010000",
    "seed": 801,
    "solution": "295641783416738592387529614629174835741853926538962147162487359874395261953216478"
  },
  {
    "analysis": {
      "candidateEliminations": 11,
      "clueCount": 27,
      "guessBranches": 26,
      "hardestTechnique": "search",
      "logicalPlacements": 5,
      "rating": 1015,
      "searchNodes": 494,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 5,
        "locked-candidate": 4,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 49
    },
    "id": "20260829-v1-608",
    "puzzle": "500000100030002700040700003000050400000401002000600080000206000012573000370084060",
    "seed": 608,
    "solution": "567839124938142756241765893726358419853491672194627385489216537612573948375984261"
  },
  {
    "analysis": {
      "candidateEliminations": 12,
      "clueCount": 27,
      "guessBranches": 25,
      "hardestTechnique": "search",
      "logicalPlacements": 8,
      "rating": 1013,
      "searchNodes": 346,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 8,
        "locked-candidate": 5,
        "naked-pair": 1,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 46
    },
    "id": "20260829-v1-844",
    "puzzle": "102000060835490000090000000000589070000040030000200805701020509000000003020004007",
    "seed": 844,
    "solution": "172835964835496721496172358213589476589647132647213895761328549954761283328954617"
  },
  {
    "analysis": {
      "candidateEliminations": 32,
      "clueCount": 24,
      "guessBranches": 21,
      "hardestTechnique": "search",
      "logicalPlacements": 9,
      "rating": 1012,
      "searchNodes": 215,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 9,
        "locked-candidate": 7,
        "naked-pair": 0,
        "hidden-pair": 3,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 48
    },
    "id": "20260829-v1-68",
    "puzzle": "030000002268000000705800030300000056600180000007200000006008000000010070900000320",
    "seed": 68,
    "solution": "139547862268931547745862931381794256652183794497256183576328419823419675914675328"
  },
  {
    "analysis": {
      "candidateEliminations": 5,
      "clueCount": 24,
      "guessBranches": 27,
      "hardestTechnique": "search",
      "logicalPlacements": 12,
      "rating": 1012,
      "searchNodes": 381,
      "techniques": {
        "naked-single": 0,
        "hidden-single": 12,
        "locked-candidate": 2,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 45
    },
    "id": "20260829-v1-529",
    "puzzle": "600000000030070820704200000007000040040800603000050000000005200960000070000602304",
    "seed": 529,
    "solution": "628319457139574826754268931287936145541827693396451782413785269962143578875692314"
  },
  {
    "analysis": {
      "candidateEliminations": 13,
      "clueCount": 25,
      "guessBranches": 25,
      "hardestTechnique": "search",
      "logicalPlacements": 17,
      "rating": 1010,
      "searchNodes": 288,
      "techniques": {
        "naked-single": 3,
        "hidden-single": 14,
        "locked-candidate": 7,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 39
    },
    "id": "20260829-v1-526",
    "puzzle": "900308017600004000020000000006200000000040290000010504000000406007000020132060009",
    "seed": 526,
    "solution": "954328617671954382328671945546289731713546298289713564895132476467895123132467859"
  },
  {
    "analysis": {
      "candidateEliminations": 3,
      "clueCount": 24,
      "guessBranches": 28,
      "hardestTechnique": "search",
      "logicalPlacements": 17,
      "rating": 1009,
      "searchNodes": 236,
      "techniques": {
        "naked-single": 7,
        "hidden-single": 10,
        "locked-candidate": 2,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 40
    },
    "id": "20260829-v1-670",
    "puzzle": "020000300001036009007008050000201670000000090000380002005000108008000030090002000",
    "seed": 670,
    "solution": "829145367541736289637928451983251674152467893764389512475693128218574936396812745"
  },
  {
    "analysis": {
      "candidateEliminations": 9,
      "clueCount": 25,
      "guessBranches": 27,
      "hardestTechnique": "search",
      "logicalPlacements": 15,
      "rating": 1008,
      "searchNodes": 302,
      "techniques": {
        "naked-single": 4,
        "hidden-single": 11,
        "locked-candidate": 3,
        "naked-pair": 0,
        "hidden-pair": 0,
        "x-wing": 0,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 41
    },
    "id": "20260829-v1-404",
    "puzzle": "405009800000600570000000000080000307054700009000068000100804030040070060500000200",
    "seed": 404,
    "solution": "475319826391682574628457193986245317254731689713968452169824735842573961537196248"
  },
  {
    "analysis": {
      "candidateEliminations": 33,
      "clueCount": 24,
      "guessBranches": 21,
      "hardestTechnique": "search",
      "logicalPlacements": 9,
      "rating": 1004,
      "searchNodes": 235,
      "techniques": {
        "naked-single": 5,
        "hidden-single": 4,
        "locked-candidate": 6,
        "naked-pair": 1,
        "hidden-pair": 1,
        "x-wing": 1,
        "xy-wing": 0,
        "simple-chain": 0
      },
      "unresolvedAfterLogic": 48
    },
    "id": "20260829-v1-76",
    "puzzle": "000000001054900000000000820006007042009360070000000000890050010700400090402000007",
    "seed": 76,
    "solution": "928673451154982736637145829386517942249368175571294683893756214765421398412839567"
  }
]
