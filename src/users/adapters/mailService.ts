import nodemailer from 'nodemailer'
import { EMAIL, EMAIL_PASS } from '../../core/settings/config'

export const mailService = {

    async sendEmail(email: string, code: string) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: EMAIL,
                pass: EMAIL_PASS
            }
        })

        let info = await transporter.sendMail({
            from: '"Kirya" <code>',
            to: email,
            subject: 'Confirmation code',
            html: `<h1>Thank for your registration</h1>
                <p>To finish registration please follow the link below:<br>
                    <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
                </p>`
        })
        return info
    }
}