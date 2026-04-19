import z from "zod";

export const UserSchema = z.object({
    id:z.coerce.number(),
    
})