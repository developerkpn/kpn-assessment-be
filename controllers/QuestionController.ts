import {
  AnswerResponse,
  QuestionFields,
  QuestionRequest,
  QuestionResult,
} from "#dep/types/MasterDataTypes";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import * as formidable from "formidable";
import {
  createQuestion,
  deleteQuestion,
  getQuestion,
  getQuestionById,
  updateQuestion,
} from "#dep/models/QuestionModel";

const parseQuestionForm = async (
  req: Request,
  dir: string,
  id: string
): Promise<{
  fields: formidable.Fields;
  files: formidable.Files;
  answers: any[];
  QAFields: any;
}> => {
  const form = new formidable.IncomingForm({
    uploadDir: dir,
    keepExtensions: true,
    multiples: true,
  });

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    form.parse(req, async (error, fields, files) => {
      console.log(files);
      if (error) {
        reject(new Error("Form parse error"));
        return;
      }

      console.log("Recieved Fields: ", fields);
      console.log("Recieved Files: ", files);
      let q_input_image_url = "";
      const answers: any[] = [];

      console.log("ini answers", answers);

      if (files.q_input_image) {
        const file = files.q_input_image[0];
        const extension = path.extname(file.originalFilename || "default.png");
        const newFilename = `question${extension}`;
        const newFilePath = path.join(dir, newFilename);

        if (fs.existsSync(newFilePath)) {
          await fs.promises.unlink(newFilePath);
        }

        await fs.promises.rename(file.filepath, newFilePath);
        q_input_image_url = `${id}/${newFilename}`;
      }

      Object.keys(files).forEach(async (key) => {
        const match = key.match(/^answers\[(\d+)\]\[image\]$/);
        if (match) {
          const index = parseInt(match[1], 10);
          const file = files[key]?.[0];
          const extension = path.extname(
            file?.originalFilename || "default.png"
          );
          const newFilename = `answer_${String.fromCharCode(
            97 + index
          )}${extension}`;
          const newFilePath = path.join(dir, newFilename);

          if (fs.existsSync(newFilePath)) {
            await fs.promises.unlink(newFilePath);
          }
          if (file) {
            await fs.promises.rename(file.filepath, newFilePath);
          }
          answers[index] = answers[index] || {};
          answers[index].image = `${id}/${newFilename}`;
        }
      });

      // Rename answers file name
      for (let key in files) {
        if (key === "q_input_image" && files[key]) {
          const oldFilePath = files[key][0].filepath;
          const originalFilename =
            files[key][0].originalFilename || "default_filename";
          const extension = path.extname(originalFilename);

          const newFilename = `question${extension}`;
          const newFilePath = path.join(dir, newFilename);

          if (fs.existsSync(newFilePath)) {
            await fs.promises.unlink(newFilePath);
          }

          // Move (rename) the uploaded file to the target location
          await fs.promises.rename(oldFilePath, newFilePath);

          // Update the QAFields object with the new file path
          q_input_image_url = id + "/" + newFilename;
        }

        const match = key.match(/^answer\[(\d+)\]\[image\]$/);
        if (match && files[key]) {
          const index = parseInt(match[1], 10);
          const oldFilePath = files[key][0].filepath;
          const originalFilename =
            files[key][0].originalFilename || "default_filename";
          const extension = path.extname(originalFilename);

          const newFilename = `answer_${String.fromCharCode(
            97 + index
          )}${extension}`;
          const newFilePath = path.join(dir, newFilename);

          if (fs.existsSync(newFilePath)) {
            await fs.promises.unlink(newFilePath);
          }

          await fs.promises.rename(oldFilePath, newFilePath);

          answers[index] = answers[index] || {};
          answers[index].image = id + "/" + newFilename;
        }
      }

      Object.keys(fields).forEach((key) => {
        const matchText = key.match(/^answers\[(\d+)\]\[text\]$/);
        const matchPoint = key.match(/^answers\[(\d+)\]\[point\]$/);
        if (matchText) {
          const index = parseInt(matchText[1], 10);
          answers[index] = answers[index] || {};
          if (fields[key]) {
            answers[index].text = fields[key][0];
          }
        }
        if (matchPoint) {
          const index = parseInt(matchPoint[1], 10);
          answers[index] = answers[index] || {};
          answers[index].point = fields[key] ? fields[key][0] : undefined;
        }
      });

      const QAFields = {
        q_input_text: fields.q_input_text ? fields.q_input_text[0] : undefined,
        q_input_image_url: files.q_input_image ? q_input_image_url : undefined,
        answer_type: fields.answer_type ? fields.answer_type[0] : undefined,
        category_id: fields.category_id ? fields.category_id[0] : undefined,
        // answers: answers,
      };

      resolve({ fields, files, answers, QAFields });
    });
  });
};

const removeImageFile = (dir: string, baseFileName: string) => {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error(`Error reading directory: ${err}`);
      return;
    }

    const matchingFile = files.find(
      (file) => path.parse(file).name === baseFileName
    );

    if (matchingFile) {
      const filePath = path.join(dir, matchingFile);

      // Remove the file
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error removing file: ${err}`);
        }
      });
    }
  });
};

export const handleCreateQuestion = async (
  req: Request,
  res: Response
): Promise<any> => {
  const id = uuidv4();
  const dir = "./uploads";
  const today = new Date();

  try {
    const { fields, answers, QAFields } = await parseQuestionForm(req, dir, id);
    const answersPayload: Record<string, any> = {};
    console.log('answers', answersPayload);
    answers.forEach((answer, index) => {
      const letter = String.fromCharCode(97 + index);
      if (answer.text) {
        answersPayload[`answer_choice_${letter}_text`] = answer.text;
      }
      if (answer.image) {
        answersPayload[`answer_choice_${letter}_image_url`] = answer.image;
      }
      answersPayload[`key_answer_point_${letter}`] = answer.point;
    });

    const payload = {
      id,
      ...QAFields,
      ...answersPayload,
      created_by: fields.created_by ? fields.created_by[0] : undefined,
      created_date: today,
    };

    console.log("ini payload", payload);
    const result = await createQuestion(payload);

    return res.status(200).send({
      message: `Success create question`,
      id: result,
    });
  } catch (error: any) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

export const handleUpdateQuestion = async (
  req: Request,
  res: Response
): Promise<any> => {
  const id = req.params.id;
  const dir = path.join(__dirname, `../uploads/question/${id}`);
  const today = new Date();

  try {
    const { fields, answers, QAFields } = await parseQuestionForm(req, dir, id);
    if (!QAFields.q_input_image_url) removeImageFile(dir, `question`);

    const answersPayload: any = {};
    answers.forEach((answer, index) => {
      const letter = String.fromCharCode(97 + index);
      answersPayload[`answer_choice_${letter}_text`] = answer.text;
      answersPayload[`answer_choice_${letter}_image_url`] = answer.image;
      answersPayload[`key_answer_point_${letter}`] = answer.point;

      if (!answer.image) removeImageFile(dir, `answer_${letter}`);
    });

    const payload = {
      id,
      ...QAFields,
      ...answersPayload,
      updated_by: fields.updated_by ? fields.updated_by[0] : undefined,
      updated_date: today,
    };

    console.log(payload);
    const result = await updateQuestion(payload, id);

    return res.status(200).send({
      message: `Success edit question`,
      id: result,
    });
  } catch (error: any) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

export const handleGetQuestion = async (_req: Request, res: Response) => {
  try {
    const result = await getQuestion();
    const formattedResult: any[] = result.map((item) => {
      const answers: AnswerResponse[] = [];
      ["a", "b", "c", "d", "e"].forEach((choice) => {
        const textKey = `answer_choice_${choice}_text`;
        const imageKey = `answer_choice_${choice}_image_url`;
        const pointKey = `key_answer_point_${choice}`;

        if (item[pointKey]) {
          answers.push({
            text: item[textKey],
            image_url: item[imageKey],
            point: item[pointKey],
          });
        }
      });

      return {
        id: item.id,
        question_code: item.question_code,
        category_id: item.category_id,
        category_name: item.category_name,
        q_input_text: item.q_input_text,
        q_input_image_url: item.q_input_image_url,
        answer_type: item.answer_type,
        created_by: item.created_by,
        answers: answers,
      };
    });

    res.status(200).send({
      message: `Success get question`,
      data: formattedResult,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleGetQuestionById = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const result = await getQuestionById(id);

    const answers: AnswerResponse[] = [];
    ["a", "b", "c", "d", "e"].forEach((choice) => {
      const textKey = `answer_choice_${choice}_text`;
      const imageKey = `answer_choice_${choice}_image_url`;
      const pointKey = `key_answer_point_${choice}`;

      if (result[pointKey]) {
        answers.push({
          text: result[textKey],
          image_url: result[imageKey],
          point: result[pointKey],
        });
      }
    });

    const totalPoints = answers.reduce(
      (acc, answer) => acc + Number(answer.point),
      0
    );

    const formattedResult: QuestionResult = {
      id: result.id,
      answer_type: result.answer_type,
      created_by: result.created_by,
      created_date: result.created_date,
      updated_by: result.updated_by,
      updated_date: result.updated_date,
      total_points: totalPoints,
      question: {
        seq: result.q_seq,
        layout_type: result.q_layout_type,
        input_text: result.q_input_text,
        input_image_url: result.q_input_image_url,
      },
      answers: answers,
    };

    res.status(200).send({
      message: `Success get question: ${id}`,
      data: formattedResult,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleDeleteQuestion = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const dir = path.join(__dirname, `../uploads/question/${id}`);
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }

    let result = await deleteQuestion(id);
    res.status(200).send({
      message: `Success delete question`,
      id: id,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};
