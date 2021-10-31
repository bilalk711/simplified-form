import { defaultSchemas } from "./regExConstants";
import { IState } from "./interfaces/IState";

export default class SimplifiedForm {
    /**
     * PRIVATE VARIABLES
     * We don't want user to manipulate these directly
     */
    private state : IState = {};
    private formName : string = 'default-form';
    private verificationSchema : {[key: keyof IState]: any} = {};
    
    /**
     * PUBLIC VARIABLES
     * These variables are allowed to be manipulated directly
     * `errors` are directly exposed because 
     * they are mostly concerned for providing informative outcome to user.
     */
    public verifyBeforeSubmission : boolean = true;
    public formValid : boolean = true;
    public errors : {[key: keyof IState]: {message : string; error : boolean;}} = {};

    /**
     * @name BaseConstructor 
     * @description Takes initial form `state` and `formName`
     * @param state 
     * @param formName 
     */
    constructor(state: any, options : {formName : string; verifyBeforeSubmission ?: boolean;}){
       this.state = state;
       this.formName = options.formName || this.formName;
       this.verifyBeforeSubmission = options.verifyBeforeSubmission || true;
    }

    /**
     * @name setVerification
     * @description Sets the verificationSchema to test the validation of form
     * @param verificationSchema 
     */
    public setVerification(verificationSchema: {[key: keyof IState]: any}){
       /**
        * We check if the `verificationSchema` provided contains properties 
        * that are subset of properties of the `state
        */
        if(Object.keys(verificationSchema).every((val: string) => Object.keys(this.state).includes(val))){
        
          /**
           * Here we also set the `errors` object based on the provided schema
           */
          for(const key in verificationSchema){
              if(this.errors[key]){
                this.errors[key] = { error : false, message : '' };
              }
          }

          this.verificationSchema = verificationSchema;
        }
        else{
          throw new Error("Some or all properties of `verificationSchema` provided are invalid.");
        }
    }

    /**
     * @name field
     * @description Sets/manipulates the value of a form field 
     * @param fieldEvent 
     */
    public field(fieldEvent: any) : void{
        const { name, value } = fieldEvent;
        this.state[name] = value;
        // Verify the field against corressponding validation schema
        if(this.verificationSchema[name]){
            let ch = true;
            // Check if corressponding schema is valid/invalid
            if(this.verificationSchema[name] instanceof RegExp){
               ch = this.verificationSchema[name].test(this.state[name]);
            }
            else if(typeof this.verificationSchema[name] === "string" && defaultSchemas[this.verificationSchema[name]]){
               ch = defaultSchemas[this.verificationSchema[name]].test(this.state[name]);
            }
            else if(this.verifyBeforeSubmission){
                throw new Error("No/Invalid validation schema provided for the given field.");
            }
            // Trigger the corressponding error on failure
            if(!ch){
                this.errors[name].error = true;
            }
            else{
                this.errors[name].error = false;
            }
        }
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
        let formValid = true;
        if(Object.keys(this.verificationSchema).length !== 0 /*Check if `verificationSchema` is set or not.*/ ) {
            /**
             * Linear Algorithm where `n` equals number of properties of state
             */
            for(const key of Object.keys(this.state)){
                const fieldVal = this.state[key];
                if(this.verificationSchema[key]){
                    let ch : boolean = true;

                    // Check if the verification field is a Regex Expression or not 
                    if(this.verificationSchema[key] instanceof RegExp){
                        ch = this.verificationSchema[key].test(fieldVal);
                    }

                    // If verification field is a string, it should be a key 
                    // from the `defaultSchemas` otherwise no verification test is executed
                    else if(Object.keys(defaultSchemas).indexOf(this.verificationSchema[key]) !== -1){
                        ch = defaultSchemas[this.verificationSchema[key]].test(fieldVal); 
                    }

                    // Trigger the corressponding error upon failure of verification
                    if(!ch) {
                        this.errors[key].error = true;
                        formValid = false;
                    }
                    else{
                        this.errors[key].error = false;                        
                    }
                }
            }
        }
        else if(this.verifyBeforeSubmission){
            throw new Error("`verificationSchema` is not set. Please provide a schema using `setVerification` method.");
        }
        this.formValid = formValid;
        return formValid;
    }

    /**
     * @name setErrors
     * @description Set the error messages for input fields
     * @param errorMsgs 
     */
    public setErrors(errorMsgs: any){
        // This method can take error messages in either
        // Array or Object type 
        if(errorMsgs instanceof Array){
            const errKeys = Object.keys(this.errors); 
            /**
             * Linear Algorithm where `n` equals number of properties of errors
             */
            for(let i=0; i < errKeys.length; i++){
                this.errors[errKeys[i]].message = errorMsgs[i];
            }
        }

        else if(errorMsgs instanceof Object){
            /**
             * Linear Algorithm where `n` equals number of items in `errorMsgs`
             */
            for(const errorKey in errorMsgs){
                if(this.errors[errorKey]){
                    this.errors[errorKey].message = errorMsgs[errorKey];
                }
            }
        }

    }

    /**
     * @name populateFormFromLocal
     * @description Populates form state from local storage by using the provided `formName`
     * @param formName 
     */
    public populateFormFromLocal(formName: string){
        if(typeof document === 'undefined') return;       
        this.state = JSON.parse(localStorage.getItem(formName) || '{}');
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

