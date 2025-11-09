import LoginBox from './components/LoginBox'

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory px-4">
      <div className="w-full max-w-md">
        <LoginBox redirectTo="/" buttonLabel="Continue" />
      </div>
    </div>
  )
}