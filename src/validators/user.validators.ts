import z from "zod";


export const UserSchema = z.object({
    userId:z.coerce.number(),
    firstName:z.string(),
    lastName:z.string(),
    email:z.string(),
    displayName:z.string(),
})


export type UserInfo = z.infer<typeof UserSchema>;
