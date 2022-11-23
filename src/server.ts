import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { convertHours } from './utils/convertHours';
import { convertMinutes } from './utils/convertMinutes';

const app = express()

app.use(express.json())
app.use(cors())

const prisma = new PrismaClient({
    log: ['query']
}); 


app.get('/games', async (req, res)=>{
    const games = await prisma.game.findMany({
        include: {
            _count: {
                select: {
                    ads: true,
                }
            }
        }
    })
    return res.json(games);
})

app.post('/games/:id/ads', async  (req, res)=>{
    const gameId = req.params.id;
    const body: any = req.body;
    const ad = await prisma.ad.create({
        data: {
            gameId,
            name: body.name,
            yaearPlayer: body.yaearPlayer,
            weekDays: body.weekDays.join(','),   
            discord: body.discord,
            hourStart: convertHours(body.hourStart),
            hourEnd: convertHours(body.hourEnd),
            useVoiceChannel: body.useVoiceChannel,
        },
    })

    return res.status(201).json(ad);
})

app.get('/games/:id/ads', async (req, res)=>{
    const gameId: any = req.params.id;
    const ads = await prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            weekDays: true,
            useVoiceChannel: true,
            yaearPlayer: true,
            hourStart: true,
            hourEnd: true,
        },
        where: {
            gameId,
        },
        orderBy: {
            createdAt: 'desc',
        }
    })

    return res.json(ads.map((ad: any) => {
        return {...ad,
             weekDays: ad.weekDays.split(','),
            hourStart: convertMinutes(ad.hourStart),
            hourEnd: convertMinutes(ad.hourEnd),
            }
    }))
})

app.get('/ads/:id/discord', async (req, res)=>{
    const adId = req.params.id;
    const ad = await prisma.ad.findUniqueOrThrow({
        select: {
            discord: true,
        },
        where: {
            id: adId,
        }
    })

    return res.json({discord: ad.discord,})
})

app.listen(4000)