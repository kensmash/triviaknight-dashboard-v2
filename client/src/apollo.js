import ApolloClient, { InMemoryCache } from "apollo-boost";
import { CachePersistor } from "apollo-cache-persist";
//queries
import categorySearchQuery from "./apollo/queries/client-categorySearchCriteria";
import categoryGenreSearchQuery from "./apollo/queries/client-categoryGenreSearchCriteria";
import questionSearchQuery from "./apollo/queries/client-questionSearchCriteria";
import addQuestionCriteriaQuery from "./apollo/queries/client-addQuestionCriteria";
//use Apollo Link State for local application data
const cache = new InMemoryCache();
//persist local cache https://gist.github.com/randytorres/2d8c36f567a1be7ddb89bb7b8ca7929d
const persistor = new CachePersistor({
  cache,
  storage: window.sessionStorage,
  //debug: true
});

const defaultState = {
  categorySearchCriteria: {
    __typename: "categorySearchCriteria",
    activePage: 1,
    limit: 15,
    name: "",
    type: null,
    genres: [],
    partycategory: false,
    showasnew: false,
    showasupdated: false,
  },
  categoryGenreSearchCriteria: {
    __typename: "categoryGenreSearchCriteria",
    activePage: 1,
    limit: 15,
    name: "",
    types: [],
  },
  questionSearchCriteria: {
    __typename: "questionSearchCriteria",
    activePage: 1,
    limit: 15,
    question: "",
    category: "",
    difficulty: "",
    type: "",
    publishedstatus: null,
  },
  addQuestionCriteria: {
    __typename: "addQuestionCriteria",
    category: "",
  },
};

const client = new ApolloClient({
  cache,
  uri: "/graphql",
  credentials:
    process.env.NODE_ENV === "production" ? "same-origin" : "include",
  clientState: {
    defaults: defaultState,
    resolvers: {
      Mutation: {
        updateCategorySearch: (
          _,
          {
            activePage,
            limit,
            name,
            type,
            genres,
            partycategory,
            showasnew,
            showasupdated,
          },
          { cache }
        ) => {
          const query = categorySearchQuery;
          const previous = cache.readQuery({ query });
          const data = {
            categorySearchCriteria: {
              ...previous.categorySearchCriteria,
              activePage,
              limit,
              name,
              type,
              genres,
              partycategory,
              showasnew,
              showasupdated,
            },
          };
          cache.writeQuery({ query, data });
          return data.categorySearchCriteria;
        },
        updateCategoryGenreSearch: (
          _,
          { activePage, limit, name, types },
          { cache }
        ) => {
          const query = categoryGenreSearchQuery;
          const previous = cache.readQuery({ query });
          const data = {
            categoryGenreSearchCriteria: {
              ...previous.categoryGenreSearchCriteria,
              activePage,
              limit,
              name,
              types,
            },
          };
          cache.writeQuery({ query, data });
          return data.categoryGenreSearchCriteria;
        },
        updateQuestionSearch: (
          _,
          {
            activePage,
            limit,
            question,
            category,
            difficulty,
            type,
            publishedstatus,
          },
          { cache }
        ) => {
          const query = questionSearchQuery;
          const previous = cache.readQuery({ query });
          const data = {
            questionSearchCriteria: {
              ...previous.questionSearchCriteria,
              activePage,
              limit,
              question,
              category,
              difficulty,
              type,
              publishedstatus,
            },
          };
          cache.writeQuery({ query, data });
          return data.questionSearchCriteria;
        },
        updateAddQuestionCriteria: (_, { category }, { cache }) => {
          const query = addQuestionCriteriaQuery;
          const previous = cache.readQuery({ query });
          const data = {
            addQuestionCriteria: {
              ...previous.addQuestionCriteria,
              category,
            },
          };
          cache.writeQuery({ query, data });
          return data.addQuestionCriteria;
        },
      },
    },
  },
});

//fix for apollo-link-state cache breaking after logout
client.onResetStore(() => cache.writeData({ data: defaultState }));

export { client, persistor };
