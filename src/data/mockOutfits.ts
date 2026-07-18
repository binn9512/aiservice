const model1 = require(
  '../assets/avatar/base_avatar.png',
);

export type SimilarItem = {
  id: string;

  name: string;

  image: any;
};

export type OutfitItemType =
  | 'closet'
  | 'recommended';

export type OutfitItem = {
  id: string;

  name: string;

  image: any;

  type: OutfitItemType;

  tags: string[];

  similarItems: SimilarItem[];
};

export type Outfit = {
  id: string;

  modelImage: any;

  items: OutfitItem[];
};

const mockOutfits: Outfit[] = [
  {
    id: '1',

    modelImage: model1,

    items: [
      {
        id: '1-1',

        name: '블랙 와이드 팬츠',

        image: model1,

        type: 'closet',

        tags: [
          '스트릿',
          '블랙',
          '와이드핏',
        ],

        similarItems: [
          {
            id: 's1',

            name: '그레이 와이드 팬츠',

            image: model1,
          },

          {
            id: 's2',

            name: '카고 팬츠',

            image: model1,
          },
        ],
      },

      {
        id: '1-2',

        name: '오버핏 후드집업',

        image: model1,

        type: 'recommended',

        tags: [
          '오버핏',
          '캐주얼',
        ],

        similarItems: [
          {
            id: 's3',

            name: '크롭 후드집업',

            image: model1,
          },
        ],
      },
    ],
  },

  {
    id: '2',

    modelImage: model1,

    items: [
      {
        id: '2-1',

        name: '화이트 셔츠',

        image: model1,

        type: 'closet',

        tags: [
          '미니멀',
          '화이트',
          '출근룩',
        ],

        similarItems: [
          {
            id: 's4',

            name: '오버핏 셔츠',

            image: model1,
          },

          {
            id: 's5',

            name: '스트라이프 셔츠',

            image: model1,
          },
        ],
      },

      {
        id: '2-2',

        name: '블랙 슬랙스',

        image: model1,

        type: 'recommended',

        tags: [
          '포멀',
          '블랙',
        ],

        similarItems: [
          {
            id: 's6',

            name: '와이드 슬랙스',

            image: model1,
          },
        ],
      },
    ],
  },

  {
    id: '3',

    modelImage: model1,

    items: [
      {
        id: '3-1',

        name: '데님 자켓',

        image: model1,

        type: 'closet',

        tags: [
          '캐주얼',
          '데님',
        ],

        similarItems: [
          {
            id: 's7',

            name: '크롭 데님 자켓',

            image: model1,
          },
        ],
      },

      {
        id: '3-2',

        name: '카고 팬츠',

        image: model1,

        type: 'recommended',

        tags: [
          '스트릿',
          '카키',
        ],

        similarItems: [
          {
            id: 's8',

            name: '조거 팬츠',

            image: model1,
          },
        ],
      },
    ],
  },
];

export default mockOutfits;