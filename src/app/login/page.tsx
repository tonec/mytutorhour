import { login, signup } from './actions';

export default function LoginPage() {
  return (
    <form className="w-full max-w-96">
      <fieldset>
        <legend className="font-medium text-neutral-800 dark:text-neutral-100">
          Profile Settings
        </legend>
      </fieldset>
    </form>
  );
}
