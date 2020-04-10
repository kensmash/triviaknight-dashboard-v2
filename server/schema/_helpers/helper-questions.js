const mongoose = require("mongoose");
const User = require("../../models/User");
const Category = require("../../models/Category");
const Question = require("../../models/Question");
const { shuffleArray } = require("./helper-arrays");

//solo games
const randomCategoriesQuestions = async (samplesize, difficulty) => {
  try {
    //get random published categories
    const categories = await Category.aggregate([
      {
        $match: {
          published: { $eq: true },
          partycategory: { $eq: false },
          joustexclusive: { $eq: false },
        },
      },
      { $sample: { size: samplesize } },
      //get cat type icon
      {
        $lookup: {
          from: "categorytypes",
          localField: "type",
          foreignField: "_id",
          as: "type",
        },
      },
      {
        $project: {
          name: 1,
          type: { $arrayElemAt: ["$type", 0] },
        },
      },
    ]);
    //for each category we generated, get a random question
    const questions = await Promise.all(
      categories.map(async (category) => {
        const question = await Question.aggregate([
          {
            $match: {
              published: { $eq: true },
              category: { $eq: category._id },
              difficulty: { $eq: difficulty },
            },
          },
          { $sample: { size: 1 } },
        ]);

        return question[0];
      })
    );
    return { categories, questions };
  } catch (error) {
    console.error(error);
  }
};

const userCategoriesQuestions = async (user) => {
  try {
    let categories = [];
    let userCats = [];
    const currentUser = await User.findOne({ _id: user.id }).populate(
      "categories"
    );

    if (currentUser.categories.length) {
      userCats = shuffleArray(
        currentUser.categories.filter(
          (cat) => cat.published && !cat.partycategory
        )
      );
    }

    if (userCats.length < 6) {
      //get random published categories
      const randomCats = await Category.aggregate([
        {
          $match: {
            _id: {
              $nin: userCats.map((cat) => {
                mongoose.Types.ObjectId(cat._id);
              }),
            },
            published: { $eq: true },
            partycategory: { $eq: false },
            joustexclusive: { $eq: false },
          },
        },
        { $sample: { size: 6 - userCats.length } },
        //get cat type icon
        {
          $lookup: {
            from: "categorytypes",
            localField: "type",
            foreignField: "_id",
            as: "type",
          },
        },
        {
          $project: {
            name: 1,
            type: { $arrayElemAt: ["$type", 0] },
          },
        },
      ]);

      categories = userCats.concat(randomCats);
    } else {
      categories = userCats.slice(0, 6);
    }
    //for each category we generated, get a random question
    const questions = await Promise.all(
      categories.map(async (category) => {
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
    return { categories, questions };
  } catch (error) {
    console.error(error);
  }
};

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
const joustQuestions = async (category) => {
  try {
    const firstQuestions = await Question.aggregate([
      {
        $match: {
          published: { $eq: true },
          category: { $eq: mongoose.Types.ObjectId(category) },
          difficulty: { $eq: "Normal" },
        },
      },
      { $sample: { size: 5 } },
    ]);

    const lastQuestions = await Question.aggregate([
      {
        $match: {
          published: { $eq: true },
          category: { $eq: mongoose.Types.ObjectId(category) },
          difficulty: { $eq: "Hard" },
        },
      },
      { $sample: { size: 2 } },
    ]);

    return firstQuestions.concat(lastQuestions);
  } catch (error) {
    console.error(error);
  }
};

//siege genre games
const siegeGenreQuestions = async (genre) => {
  try {
    //get random published categories
    let categories = await Category.aggregate([
      {
        $match: {
          published: { $eq: true },
          partycategory: { $eq: false },
          genres: { $eq: mongoose.Types.ObjectId(genre) },
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
            genres: { $eq: mongoose.Types.ObjectId(genre) },
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
};

//siege category type games
const siegeCatTypeQuestions = async (cattype) => {
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
      { $sample: { size: 10 } },
    ]);
    if (categories.length < 10) {
      const catsToGet = 10 - categories.length;
      const newCategories = await Category.aggregate([
        {
          $match: {
            published: { $eq: true },
            partycategory: { $eq: false },
            joustexclusive: { $eq: false },
            type: { $eq: mongoose.Types.ObjectId(cattype) },
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
};

//questions to cache for offline solo play
const tkGameQuestions = async () => {
  try {
    const questions = await Question.aggregate([
      {
        $match: {
          published: { $eq: true },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $match: {
          "category.published": true,
          "category.partycategory": false,
          "category.joustexclusive": false,
        },
      },
      { $sample: { size: 250 } },
      {
        $project: {
          question: 1,
          difficulty: 1,
          answers: 1,
          category: { $arrayElemAt: ["$category", 0] },
        },
      },
    ]);
    return questions;
  } catch (error) {
    console.error(error);
  }
};

//press your luck games
const pressLuckQuestions = async (topictype, topicid) => {
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
        { $sample: { size: 12 } },
      ]);
      if (categories.length < 12) {
        const catsToGet = 12 - categories.length;
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
      const questions = await Promise.all(
        categories.map(async (category) => {
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
        { $sample: { size: 12 } },
      ]);
      if (categories.length < 12) {
        const catsToGet = 12 - categories.length;
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
      const questions = await Promise.all(
        categories.map(async (category) => {
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

      return { categories, questions };
    } catch (error) {
      console.error(error);
    }
  } else {
    //Category
    try {
      const category = await Category.findOne({ _id: topicid });

      const questions = await Question.aggregate([
        {
          $match: {
            published: { $eq: true },
            category: { $eq: mongoose.Types.ObjectId(topicid) },
            difficulty: { $eq: "Normal" },
          },
        },
        { $sample: { size: 10 } },
      ]);
      return { categories: [category], questions };
    } catch (error) {
      console.error(error);
    }
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
        { $sample: { size: 8 } },
      ]);
      if (categories.length < 8) {
        const catsToGet = 8 - categories.length;
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
        { $sample: { size: 8 } },
      ]);
      if (categories.length < 8) {
        const catsToGet = 12 - categories.length;
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
            category: { $eq: mongoose.Types.ObjectId(category) },
            difficulty: { $eq: "Normal" },
          },
        },
        { $sample: { size: 7 } },
      ]);

      const lastQuestions = await Question.aggregate([
        {
          $match: {
            published: { $eq: true },
            category: { $eq: mongoose.Types.ObjectId(category) },
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

module.exports = {
  randomCategoriesQuestions,
  userCategoriesQuestions,
  joustQuestions,
  siegeGenreQuestions,
  siegeCatTypeQuestions,
  tkGameQuestions,
  pressLuckQuestions,
  questQuestions,
  soloQuestions,
};
