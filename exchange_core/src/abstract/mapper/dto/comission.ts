import { IMap } from "@abstract/mapping";
import { ComissionDTO } from "@abstract/dto/comission";
import { Comission } from "@prisma/client";

export const comission_mapper: IMap<Comission, ComissionDTO> = {
    from: (entity: Comission) => Object.assign(new ComissionDTO(), entity),
    to: function (data: ComissionDTO): Comission {
        return {
            id: data.id!,
            amount: data.amount!,
            title: data.title!
        }
    }
}
