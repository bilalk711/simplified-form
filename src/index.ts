import { defaultSchemas } from "./regExConstants";
import { IState } from "./interfaces/IState";

export default class SimplifiedForm {
    private state : IState = {};
    private formName : string = 'default-form';
    // Default Schemas, more can be added on requirement
    private verificationSchema : {[key: keyof IState]: any} = {};
    
    public formValid : boolean = false;
    public errors : any = {};

    /**
     * @name BaseConstructor 
     * @description Takes initial form `state` and `formName`
     * @param state 
     * @param formName 
     */
    constructor(state: any, formName : string){
       this.state = state;
       this.formName = formName;
    }

    /**
     * @name setVerification
     * @description Sets the verificationSchema to test the validation of form
     * @param verificationSchema 
     */
    public setVerification(verificationSchema: any){
       this.verificationSchema = verificationSchema;
    }

    /**
     * @name field
     * @description Sets/manipulates the value of a form field 
     * @param fieldEvent 
     */
    public field(fieldEvent: any) : void{
        const { name, value } = fieldEvent;
        this.state[name] = value;
    }

    /**
     * @name getFields
     * @description Returns all keys/fields of the form state
     * @returns formFields
     */
    public getFields(): any{
        return Object.keys(this.state);
    }

    /**
     * @name getState
     * @description Returns the state of the form
     * @returns state
     */
    public getState(): any{
        return this.state;
    }

    /**
     * @name verifyFormState
     * @description Verifies if form is valid or not using the `verificationSchema` that contains `regex` expressions for verifying state data
     * @returns formValid
     */
    public verifyFormState(){
        if(this.verificationSchema) {
            for(const key in this.state){
                const fieldVal = this.state[key];
                if(this.verificationSchema[key]){
                    let ch : boolean = true;

                    // Check if the verification field is Regex Expression 
                    if(this.verificationSchema[key] instanceof RegExp){
                        ch = this.verificationSchema[key].test(fieldVal);
                    }
                    // If verification field is a string, it should be a key 
                    // from the `defaultSchemas`
                    else if(Object.keys(defaultSchemas).indexOf(this.verificationSchema[key]) !== -1){
                        ch = defaultSchemas[this.verificationSchema[key]].test(fieldVal); 
                    }

                    if(!ch) return false;
                }
            }
        }
        this.formValid = true;
        return true;
    }

    /**
     * @name populateFormFromLocal
     * @description Populates form state from local storage by using the provided `formName`
     * @param formName 
     */
    public populateFormFromLocal(formName: string){
        if(typeof document === 'undefined') return;       
        this.state = JSON.parse(formName);
        this.formName = formName;
    }

    /**
     * @name storeFormInLocal
     * @description Stores form state in local storage of the browser
     */
    public storeFormInLocal(): void{
        if(typeof document === 'undefined') return;
        localStorage.setItem(this.formName, JSON.stringify(this.state));
    }

}
