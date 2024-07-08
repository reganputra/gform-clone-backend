import mongoose from "mongoose";
import Form from "../models/Form.js";
import Answer from "../models/Answer.js";
import answerDuplicate from "../libraries/answerDuplicate.js";
import questionRequiredButEmpty from "../libraries/questionRequiredButEmpty.js";


class AnswerController {

    async store(req, res) {
        try {
        if(!req.params.formId) {throw{code: 400, message: "Required_Form_ID" }}
        if(!mongoose.Types.ObjectId.isValid(req.params.formId)) {throw{code: 400, message: Invalid_ID}}

        const form = await Form.findById(req.params.formId)

        const isDuplicated = await answerDuplicate(req.body.answers)
        if(isDuplicated) {throw{code: 400, message: "Duplicate_Answer"}}

        const questionRequiredEmpty = await questionRequiredButEmpty(form, req.body.answers)
        if(questionRequiredEmpty) {throw{code: 400, message: "Required_Question_Is_Empty"}}


        let fields = {}
        req.body.answers.forEach(answer => {
            fields[answer.questionId] = answer.value
        })

        const answer = Answer.create({
            formId: req.params.formId,
            userId: req.jwt.id,
            ...fields
        })
        if(!answer) {throw{ code: 400, message: "Answer_Failed"}}

        return res.status(200).json({
            status: true,
            message: "Answer_Success",
            answer
        })
        
        } catch (error) {
            res.status(error.code || 500)
                .json({
                    status: false,
                    message: error.message
                })
        }
    }

}

export default new AnswerController();