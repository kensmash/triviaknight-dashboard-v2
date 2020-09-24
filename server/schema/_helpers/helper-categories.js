const Category = require("../../models/Category");

const catListReponse = async (input) => {
  try {
    const catList = await Category.aggregate([
      //find all questions
      {
        $lookup: {
          from: "questions",
          localField: "_id",
          foreignField: "category",
          pipeline: [{ $match: { difficulty: "Normal" } }],
          as: "normalquestions",
        },
      },
      {
        $lookup: {
          from: "questions",
          localField: "_id",
          foreignField: "category",
          pipeline: [{ $match: { difficulty: "Hard" } }],
          as: "hardquestions",
        },
      },
      //get type info from reference
      {
        $lookup: {
          from: "type",
          localField: "_id",
          foreignField: "_id",
          as: "type",
        },
      },
      //get genre info from reference
      {
        $lookup: {
          from: "genre",
          localField: "_id",
          foreignField: "_id",
          as: "genres",
        },
      },
      {
        $project: {
          name: 1,
          published: 1,
          showasnew: 1,
          showasupdated: 1,
          nextquestactive: 1,
          type: { $arrayElemAt: ["$type.name", 0] },
          normalquestions: { $size: "$normalquestions" },
          hardquestions: { $size: "$hardquestions" },
        },
      },
    ]);
    return catList;
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  catListReponse,
};
