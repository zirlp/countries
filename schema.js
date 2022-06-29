import countriesList from 'countries-list';
import provinces from 'provinces';
import sift from 'sift';
import {gql} from 'apollo-server';
import { v1 as uuid } from 'uuid';

var contacts = [];

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
    contacts: [Contact]
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

  type Contact {
    name: String!
    country: Country!
    mail: String!
    comment: String
    code: ID!
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
    contacts: [Contact!]
  }

type Mutation {
  editCountryProperties(
    country: String!
    comment: String
    url: String
  ): Country!

  createContact(
    name: String!
    country: String!
    mail: String!
    comment: String
  ): Contact!

  editContact(
    code: ID!
    country: String!
    name: String!
    mail: String!
    comment: String
  ): Contact!

  deleteContact(
    code: ID!
    country: String!
  ): [Contact!]

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
        .filter(filterToSift(filter)),
  
    contacts: () => contacts    

  }, 
  Mutation: {
  
    editCountryProperties: (root, args) => {
     
      const code = args.country

      if (!Object.hasOwnProperty.call(countriesList.countries, code)) return null;
        
      const country = countriesList.countries[code]

      const updatedCountry = {...country, comment: args.comment, url: args.url}
      
      countriesList.countries[code] = updatedCountry

      return updatedCountry;
    },
    createContact: (root, args) => {
      const contact = {...args, code: uuid()};

      //the country must be the code to do this
      const country = countriesList.countries[contact.country]
      
      if(!country.contacts){
        countriesList.countries[contact.country] = {...country, contacts: [contact]}
      } else { countriesList.countries[contact.country].contacts.push(contact)  }
      
      contact.country = country

      //There can not be more than one contact with same name
      if(contacts.find(c => c.name === contact.name)) return null
      else contacts.push(contact)
      return contact
    },

    deleteContact: (root, args) => {
      const contact = {...args}

      const updatedList = contacts.filter(c=> c.code !== contact.code)
      contacts = updatedList; //this is to update the mainList of contacts for future uses i guess(?)
      
      const contactList = countriesList.countries[contact.country].contacts;
      const updatedContacts = contactList.filter(c=>c.code !==contact.code) 
      countriesList.countries[contact.country].contacts = updatedContacts; //update contacts from X country

      return contacts;
    },

    editContact: (root, args) => {
      const contact = {...args} //because i can edit every prop

      const index = contacts.findIndex(c=> c.code === contact.code);
      if(index===-1) return null;
      contacts[index] = contact; 

      const contactList = countriesList.countries[contact.country].contacts;
      const listIndex = contactList.findIndex(c=> c.code === contact.code)
      countriesList.countries[contact.country].contacts[listIndex] = contact

      return contact;
    }

    
  }
};

// console.log({...countriesList.countries[si], "comment": "hola"})