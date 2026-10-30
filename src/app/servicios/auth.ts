import { Service } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../enviroments/enviroment';

@Service()
export class Auth {
    public supabase: SupabaseClient;
    public currentUser: any | undefined | null;

    constructor(){
        this.supabase = createClient(environment.supabaseUrl, environment.supabasePublishableKey);
        try{
            this.getUser().then((data)=>{
                if(data.data.user){
                    this.currentUser = data.data.user;
                    console.log(this.currentUser);
                }
                else{
                    console.log(data);
                    console.log("Fallo el data.data.user")
                }
            })
        }
        catch(error){
            console.log(error);
        }
    }

    signIn(email:string, password:string){
        return this.supabase.auth.signInWithPassword({email, password});
    }

    signUp(email:string, password:string){
        return this.supabase.auth.signUp({email, password});
    }

    insertData(data:any, tabla: string){
        return this.supabase.from(tabla).insert(data);
    }

    selectData(tabla: string, columna ?:string, valor ?:any){
        if(columna && valor){
            return this.supabase.from(tabla).select("*").eq(columna,valor).single();
        }

        return this.supabase.from(tabla).select("*");
    }

    signOut(){
        return this.supabase.auth.signOut();
    }

    getUser(){
        return this.supabase.auth.getUser();
    }

    getUsers(){
        return this.supabase.auth.admin.listUsers();
    }

    async getId(){
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user || !user.email) {
            return 0; 
        }

        const correo = user.email;
        const {data} = await this.supabase.from('datosRegistrados').select("id").eq('email', correo).single();

        if(data){
            console.log(data);
            return data.id
        }
       
        return null
    }
}
