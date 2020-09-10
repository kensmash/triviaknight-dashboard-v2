const mongoose = require("mongoose");
const Category = require("../../models/Category");
const Question = require("../../models/Question");

//solo games
const soloQuestions = async (cattype) => {
  try {
    //get random published categories
    let categories = await Category.aggregate([
      {
        $match: {
          published: { $eq: true },
          partycategory: { $eq: false },
          joustexclusive: { $eq: false },
          type: { $eq: mongoose.Types.ObjectId(cattype) },
        },
      },
      { $sample: { size: 7 } },
    ]);

    if (categories.length < 7) {
      categories = await Category.aggregate([
        {
          $match: {
            published: { $eq: true },
            partycategory: { $eq: false },
            type: { $eq: mongoose.Types.ObjectId(cattype) },
          },
        },
        { $sample: { size: 7 } },
      ]);
    }

    //for each category we generated, get a random question
    const firstQuestions = await Promise.all(
      categories.slice(0, 5).map(async (category) => {
        const question = await Question.aggregate([
          {
            $match: {
              published: { $eq: true },
              category: { $eq: category._id },
              difficulty: { $eq: "Normal" },
            },
          },
          { $sample: { size: 1 } },
        ]);

        return question[0];
      })
    );
    const lastQuestions = await Promise.all(
      categories.slice(5).map(async (category) => {
        const question = await Question.aggregate([
          {
            $match: {
              published: { $eq: true },
              category: { $eq: category._id },
              difficulty: { $eq: "Hard" },
            },
          },
          { $sample: { size: 1 } },
        ]);

        return question[0];
      })
    );

    const questions = firstQuestions.concat(lastQuestions);
    return { categories, questions };
  } catch (error) {
    console.error(error);
  }
};

//joust games
const joustQuestions = async (category, previousquestions) => {
  const previousQuestionIds = previousquestions.map((question) =>
    mongoose.Types.ObjectId(question)
  );

  try {
    let firstQuestions = await Question.aggregate([
      {
        $match: {
          published: { $eq: true },
          category: { $eq: mongoose.Types.ObjectId(category) },
          _id: { $nin: previousQuestionIds },
          difficulty: { $eq: "Normal" },
        },
      },
      { $sample: { size: 5 } },
    ]);

    if (firstQuestions.length < 5) {
      // console.log("first questions less than five");
      firstQuestions = await Question.aggregate([
        {
          $match: {
            published: { $eq: true },
            category: { $eq: mongoose.Types.ObjectId(category) },
            difficulty: { $eq: "Normal" },
          },
        },
        { $sample: { size: 5 } },
      ]);
    }

    let lastQuestions = await Question.aggregate([
      {
        $match: {
          published: { $eq: true },
          category: { $eq: mongoose.Types.ObjectId(category) },
          _id: { $nin: previousQuestionIds },
          difficulty: { $eq: "Hard" },
        },
      },
      { $sample: { size: 2 } },
    ]);

    if (lastQuestions.length < 2) {
      //console.log("last questions less than two");
      lastQuestions = await Question.aggregate([
        {
          $match: {
            published: { $eq: true },
            category: { $eq: mongoose.Types.ObjectId(category) },
            difficulty: { $eq: "Hard" },
          },
        },
        { $sample: { size: 2 } },
      ]);
    }

    return firstQuestions.concat(lastQuestions);
  } catch (error) {
    console.error(error);
  }
};

//siege games
const siegeQuestions = async (category, previousquestions) => {
  const previousQuestionIds = previousquestions.map((question) =>
    mongoose.Types.ObjectId(question)
  );

  try {
    let firstQuestions = await Question.aggregate([
      {
        $match: {
          published: { $eq: true },
          category: { $eq: mongoose.Types.ObjectId(category) },
          _id: { $nin: previousQuestionIds },
          difficulty: { $eq: "Normal" },
        },
      },
      { $sample: { size: 7 } },
    ]);

    if (firstQuestions.length < 7) {
      firstQuestions = await Question.aggregate([
        {
          $match: {
            published: { $eq: true },
            category: { $eq: mongoose.Types.ObjectId(category) },
            difficulty: { $eq: "Normal" },
          },
        },
        { $sample: { size: 7 } },
      ]);
    }

    let lastQuestions = await Question.aggregate([
      {
        $match: {
          published: { $eq: true },
          category: { $eq: mongoose.Types.ObjectId(category) },
          _id: { $nin: previousQuestionIds },
          difficulty: { $eq: "Hard" },
        },
      },
      { $sample: { size: 13 } },
    ]);

    if (lastQuestions.length < 13) {
      lastQuestions = await Question.aggregate([
        {
          $match: {
            published: { $eq: true },
            category: { $eq: mongoose.Types.ObjectId(category) },
            difficulty: { $eq: "Hard" },
          },
        },
        { $sample: { size: 13 } },
      ]);
    }

    return firstQuestions.concat(lastQuestions);
  } catch (error) {
    console.error(error);
  }
};

//quest games
const questQuestions = async (topictype, topicid) => {
  if (topictype === "Genre") {
    //Genre
    try {
      //get random published categories
      let categories = await Category.aggregate([
        {
          $match: {
            published: { $eq: true },
            partycategory: { $eq: false },
            genres: { $eq: mongoose.Types.ObjectId(topicid) },
          },
        },
        { $sample: { size: 10 } },
      ]);
      if (categories.length < 10) {
        const catsToGet = 10 - categories.length;
        const newCategories = await Category.aggregate([
          {
            $match: {
              published: { $eq: true },
              partycategory: { $eq: false },
              genres: { $eq: mongoose.Types.ObjectId(topicid) },
            },
          },
          { $sample: { size: catsToGet } },
        ]);
        categories = categories.concat(newCategories);
      }

      //for each category we generated, get a random question
      const firstQuestions = await Promise.all(
        categories.slice(0, 7).map(async (category) => {
          const question = await Question.aggregate([
            {
              $match: {
                published: { $eq: true },
                category: { $eq: category._id },
                difficulty: { $eq: "Normal" },
              },
            },
            { $sample: { size: 1 } },
          ]);

          return question[0];
        })
      );
      const lastQuestions = await Promise.all(
        categories.slice(7).map(async (category) => {
          const question = await Question.aggregate([
            {
              $match: {
                published: { $eq: true },
                category: { $eq: category._id },
                difficulty: { $eq: "Hard" },
              },
            },
            { $sample: { size: 1 } },
          ]);

          return question[0];
        })
      );

      const questions = firstQuestions.concat(lastQuestions);

      return { categories, questions };
    } catch (error) {
      console.error(error);
    }
    //Category Type
  } else if (topictype === "Category Type") {
    try {
      //get random published categories
      let categories = await Category.aggregate([
        {
          $match: {
            published: { $eq: true },
            partycategory: { $eq: false },
            type: { $eq: mongoose.Types.ObjectId(topicid) },
          },
        },
        { $sample: { size: 10 } },
      ]);
      if (categories.length < 10) {
        const catsToGet = 10 - categories.length;
        const newCategories = await Category.aggregate([
          {
            $match: {
              published: { $eq: true },
              partycategory: { $eq: false },
              type: { $eq: mongoose.Types.ObjectId(topicid) },
            },
          },
          { $sample: { size: catsToGet } },
        ]);
        categories = categories.concat(newCategories);
      }

      //for each category we generated, get a random question
      const firstQuestions = await Promise.all(
        categories.slice(0, 7).map(async (category) => {
          const question = await Question.aggregate([
            {
              $match: {
                published: { $eq: true },
                category: { $eq: category._id },
                difficulty: { $eq: "Normal" },
              },
            },
            { $sample: { size: 1 } },
          ]);

          return question[0];
        })
      );
      const lastQuestions = await Promise.all(
        categories.slice(7).map(async (category) => {
          const question = await Question.aggregate([
            {
              $match: {
                published: { $eq: true },
                category: { $eq: category._id },
                difficulty: { $eq: "Hard" },
              },
            },
            { $sample: { size: 1 } },
          ]);

          return question[0];
        })
      );

      const questions = firstQuestions.concat(lastQuestions);

      return { categories, questions };
    } catch (error) {
      console.error(error);
    }
  } else {
    //Category
    try {
      const category = await Category.findOne({ _id: topicid });

      const firstQuestions = await Question.aggregate([
        {
          $match: {
            published: { $eq: true },
            category: { $eq: mongoose.Types.ObjectId(category._id) },
            difficulty: { $eq: "Normal" },
          },
        },
        { $sample: { size: 7 } },
      ]);

      const lastQuestions = await Question.aggregate([
        {
          $match: {
            published: { $eq: true },
            category: { $eq: mongoose.Types.ObjectId(category._id) },
            difficulty: { $eq: "Hard" },
          },
        },
        { $sample: { size: 3 } },
      ]);

      const questions = firstQuestions.concat(lastQuestions);

      return { categories: [category], questions };
    } catch (error) {
      console.error(error);
    }
  }
};

//round table
const roundTableGameQuestion = async (catid, difficulty, previousquestions) => {
  const questionIds = previousquestions.map((question) =>
    mongoose.Types.ObjectId(question)
  );

  try {
    const question = await Question.aggregate([
      {
        $match: {
          published: { $eq: true },
          category: { $eq: mongoose.Types.ObjectId(catid) },
          difficulty: { $eq: difficulty },
          type: { $eq: "Multiple Choice" },
          guessable: { $eq: true },
          _id: { $nin: questionIds },
        },
      },
      { $sample: { size: 1 } },
    ]);

    return question[0];
  } catch (error) {
    console.error(error);
  }
};

//different question advantage
const differentQuestion = async (catid, currentquestions) => {
  const questionIds = currentquestions.map((question) =>
    mongoose.Types.ObjectId(question)
  );

  try {
    const question = await Question.aggregate([
      {
        $match: {
          published: { $eq: true },
          category: { $eq: mongoose.Types.ObjectId(catid) },
          difficulty: { $eq: "Normal" },
          _id: { $nin: questionIds },
        },
      },
      { $sample: { size: 1 } },
    ]);

    return question[0];
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  soloQuestions,
  joustQuestions,
  siegeQuestions,
  questQuestions,
  roundTableGameQuestion,
  differentQuestion,
};
