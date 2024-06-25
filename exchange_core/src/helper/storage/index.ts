import { PrismaClient } from '@prisma/client'

class DbConnectionWrapper{
    static instance: PrismaClient;
    static getInstance() {
        if (!DbConnectionWrapper.instance) {
            let instance = new PrismaClient({log:[{
                emit: "event",
                level: "query",
              }]})
            // instance.$on("query", async (e) => {
            //     console.log(`${e.query} ${e.params}`)
            // });
            DbConnectionWrapper.instance = instance;
        }
        return DbConnectionWrapper.instance;
    }
}

export function storage(){
    return DbConnectionWrapper.getInstance()
}

