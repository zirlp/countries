import countriesList from 'countries-list';
import provinces from 'provinces';
import sift from 'sift';
import {gql} from 'apollo-server';

export const typeDefs = gql`
  type Continent {
    code: ID!
    name: String!
    countries: [Country!]!
  }

  type Country {
    code: ID!
    name: String!
    native: String!
    phone: String!
    continent: Continent!
    capital: String
    currency: String
    languages: [Language!]!
    emoji: String!
    emojiU: String!
    states: [State!]!
    url: String
    comment: String
  }

  type State {
    code: String
    name: String!
    country: Country!
  }

  type Language {
    code: ID!
    name: String
    native: String
    rtl: Boolean!
  }

  input StringQueryOperatorInput {
    eq: String
    ne: String
    in: [String]
    nin: [String]
    regex: String
    glob: String
  }

  input CountryFilterInput {
    code: StringQueryOperatorInput
    currency: StringQueryOperatorInput
    continent: StringQueryOperatorInput
  }

  input ContinentFilterInput {
    code: StringQueryOperatorInput
  }

  input LanguageFilterInput {
    code: StringQueryOperatorInput
  }

  type Query {
    continents(filter: ContinentFilterInput): [Continent!]!
    continent(code: ID!): Continent
    countries(filter: CountryFilterInput): [Country!]!
    country(code: ID!): Country
    languages(filter: LanguageFilterInput): [Language!]!
    language(code: ID!): Language
  }

type Mutation {
  editCountryProperties(
    country: String!
    comment: String
    url: String
  ): Country
}

`;

function filterToSift(filter = {}) {
  return sift(
    Object.entries(filter).reduce(
      (acc, [key, operators]) => ({
        ...acc,
        [key]: operatorsToSift(operators)
      }),
      {}
    )
  );
}

function operatorsToSift(operators) {
  return Object.entries(operators).reduce(
    (acc, [operator, value]) => ({
      ...acc,
      ['$' + operator]: value
    }),
    {}
  );
}

const {continents, countries, languages} = countriesList;

export const resolvers = {
  Country: {
    capital: country => country.capital || null,
    currency: country => country.currency || null,
    continent: ({continent}) => ({
      code: continent,
      name: continents[continent]
    }),
    languages: country =>
      country.languages.map(code => {
        const language = languages[code];
        return {
          ...language,
          code
        };
      }),
    states: country =>
      provinces.filter(province => province.country === country.code)
  },
  State: {
    code: state => state.short,
    country: state => countries[state.country]
  },
  Continent: {
    countries: continent =>
      Object.entries(countries)
        .filter(entry => entry[1].continent === continent.code)
        .map(([code, country]) => ({
          ...country,
          code
        }))
  },
  Language: {
    rtl: language => Boolean(language.rtl)
  },
  Query: {
    continent(parent, {code}) {
      const name = continents[code];
      return (
        name && {
          code,
          name
        }
      );
    },
    continents: (parent, {filter}) =>
      Object.entries(continents)
        .map(([code, name]) => ({
          code,
          name
        }))
        .filter(filterToSift(filter)),
    country(parent, {code}) {
      const country = countries[code];
      return (
        country && {
          ...country,
          code
        }
      );
    },
    countries: (parent, {filter}) =>
      Object.entries(countries)
        .map(([code, country]) => ({
          ...country,
          code
        }))
        .filter(filterToSift(filter)),
    language(parent, {code}) {
      const language = languages[code];
      return (
        language && {
          ...language,
          code
        }
      );
    },
    languages: (parent, {filter}) =>
      Object.entries(languages)
        .map(([code, language]) => ({
          ...language,
          code
        }))
        .filter(filterToSift(filter))
  }, 
  Mutation: {
  
    editCountryProperties: (root, args) => {
     
      const code = args.country

      if (!Object.hasOwnProperty.call(countriesList.countries, code)) return null;
        
      const country = countriesList.countries[code]

      const updatedCountry = {...country, comment: args.comment, url: args.url}
      
      countriesList.countries[code] = updatedCountry

      return updatedCountry;
    }
    // editCountryProperties($cc: CountryCode!, $props: Props!) {
    //   editProperties(CountryCode: $cc, Props: $props) {
    //     url
    //     comment
    //   }
    // } 
    
  }
};

// console.log({...countriesList.countries[si], "comment": "hola"})