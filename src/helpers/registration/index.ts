import { ref, Ref } from "vue";
import { useRouter } from "vue-router";
import { useUser } from "@/store/user";
import { UserDataToValidate, UserData, ApiValidateResponse, PostImageResponse } from '@/interfaces';

interface UserRegistrationUtil {
  email: Ref<string>;
  password: Ref<string>;
  firstName: Ref<string>;
  lastName: Ref<string>;
  file: Ref<File | null>;
  avatarUrl: Ref<string>;
  fileName: Ref<string>;
  errors: Ref<{ [key: string]: string }>;
  isValidForRegistration: Ref<boolean>;
  clearFileInput: () => void;
  handleAvatarChange: (event: Event) => void;
  uploadImageHandler: () => Promise<void>;
  validateHandler: () => Promise<void>;
  registerHandler: () => Promise<void>;
  clearErrors: () => void
}

export function useUserRegistration(): UserRegistrationUtil {
  const userStore = useUser();
  const router = useRouter();

  const email = ref("");
  const password = ref("");
  const firstName = ref("");
  const lastName = ref("");
  const file = ref<File | null>(null);
  const avatarUrl = ref("");
  const fileName = ref("");
  const errors = ref<{ [key: string]: string }>({});
  const isValidForRegistration = ref(false);

  const clearFileInput = (): void => {
    file.value = null;
    fileName.value = "";
  };

  const clearErrors = (): void => {
    errors.value = {}
  }

  const handleAvatarChange = (event: Event): void => {
    if (event.target instanceof HTMLInputElement && event.target.files) {
      file.value = event.target.files[0];
      fileName.value = event.target.files[0].name;
    }
    
  };

  const uploadImageHandler = async (): Promise<void> => {
    try {
      const result: PostImageResponse= await userStore.uploadImage(file.value as File);
      avatarUrl.value = result.data.secure_url;
    } catch (error) {
      console.log(error);
    }
  };

  const validateHandler = async (): Promise<void> => {
    const userData: UserDataToValidate = {
      email: email.value,
      password: password.value,
      firstName: firstName.value,
      lastName: lastName.value,
    };

    try {
      const resp: ApiValidateResponse | void = await userStore.validate(userData);
      if (resp) {
        errors.value = resp.errors;
        isValidForRegistration.value = resp.isValid;
      }
      
    } catch (error) {
      console.error(error);
    }
  };

  const registerHandler = async (): Promise<void> => {
    await validateHandler();
    if (!isValidForRegistration.value) return;
    if (file.value) await uploadImageHandler();
    const userData: UserData = {
      email: email.value,
      password: password.value,
      firstName: firstName.value,
      lastName: lastName.value,
      avatar: avatarUrl.value,
      isAdmin: false, 
    };
    await userStore.registration(userData);
    router.push('/');
  };

  return {
    email,
    password,
    firstName,
    lastName,
    file,
    fileName,
    avatarUrl,
    errors,
    isValidForRegistration,
    uploadImageHandler,
    clearFileInput,
    validateHandler,
    handleAvatarChange,
    registerHandler,
    clearErrors
  };
}
