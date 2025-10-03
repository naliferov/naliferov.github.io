import express from 'express'
import fs from 'fs'
import OpenAI from 'openai'

const token = fs.readFileSync('token.txt', 'utf8')
const client = new OpenAI({ apiKey: token })

// const response = await client.chat.completions.create({
//   model: 'gpt-4o-mini',
//   messages: [
//     { role: 'user', content: 'Напиши функцию на JavaScript, которая реверсирует строку' }
//   ],
// })
// console.log(response)

const app = express()
const PORT = 3000

app.use(express.json())
app.get('/', (req, res) => {
  res.send('Hello from Express!')
})

app.post('/echo', (req, res) => {
  res.json({
    message: 'You sent:',
    body: req.body
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`)
})