import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { UsersRepository } from "../repositories/UsersRepository";
import { SurveysRepository } from "../repositories/SurveysRepository";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";
import  SendMailService from "../services/SendMailService";
import { resolve } from "path";

class SendMailController {
    
    async execute(request: Request, response: Response) {
        const { email, survey_id } = request.body;

        const usersRepository = getCustomRepository(UsersRepository);
        const surveysRepository = getCustomRepository(SurveysRepository);
        const surveysUserRepository = getCustomRepository(SurveysUsersRepository);

        const user = await usersRepository.findOne({ email });

        if(!user) {
            return response.status(400).json({
                error: "User does not exists!",
            });
        }

        const survey = await surveysRepository.findOne({id: survey_id });

        if(!survey) {
            return response.status(400).json({
                error: "Survey does not exists!"
            });
        }

        const variables = {
            name: user.name,
            title: survey.title,
            description: survey.description,
            user_id: user.id,
            link: process.env.URL_MAIL,
        };

         // Enviar e-mail para o usuário
         const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs");

        const surveyUserAlreadyExists = await surveysUserRepository.findOne({
            where: [{user_id: user.id}, {value: null}],
            relations: ["user", "survey"],
        });

        if(surveyUserAlreadyExists) {
            await SendMailService.execute(email, survey.title, variables, npsPath);
            return response.json(surveyUserAlreadyExists);
        }

        // Salvar as informações na tabela surveys_users
        const surveyUser = surveysUserRepository.create({
            user_id: user.id,
            survey_id,
        });

        await surveysUserRepository.save(surveyUser);

        await SendMailService.execute(email, survey.title, variables, npsPath);
    
        return response.json(surveyUser);
    }
}

export { SendMailController }