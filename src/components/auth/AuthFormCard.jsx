import { useEffect, useState } from 'react'
import { FiArrowRight, FiLoader, FiLock, FiMail, FiUser } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { setCredentials } from '../../features/auth/authSlice'
import { useSignInMutation, useSignUpMutation } from '../../services/authApi'
import {
  Card,
  CardEyebrow,
  CardSubtitle,
  CardTitle,
  Feedback,
  FieldInput,
  FieldLabel,
  Footer,
  Form,
  Header,
  Spin,
  SubmitButton,
} from '../../styles/components/authFormCard.styles'

const initialFormState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
}


function getErrorMessage(error, fallbackMessage) {
  return (
    error?.data?.message ||
    error?.data?.error ||
    error?.message ||
    fallbackMessage
  )
}


export function AuthFormCard({ mode, notice = '' }) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [formState, setFormState] = useState(initialFormState)
  const [feedbackMessage, setFeedbackMessage] = useState(notice)
  const [feedbackType, setFeedbackType] = useState(notice ? 'success' : 'neutral')
  const [signIn, signInResult] = useSignInMutation()
  const [signUp, signUpResult] = useSignUpMutation()

  const isSignUp = mode === 'sign-up'
  const isLoading = signInResult.isLoading || signUpResult.isLoading
  const redirectTo = location.state?.redirectTo ?? '/dashboard'

  useEffect(() => {
    setFeedbackMessage(notice)
    setFeedbackType(notice ? 'success' : 'neutral')
  }, [notice])

  function handleChange(event) {
    const { name, value } = event.target

    setFormState((currentState) => ({
      ...currentState,
      [name]: value,
    }))
  }


  async function handleSubmit(event) {
    event.preventDefault()

    // This clears the previous message before the next request starts.
    setFeedbackMessage('')
    setFeedbackType('neutral')

    if (isSignUp && formState.password !== formState.confirmPassword) {
      setFeedbackType('error')
      setFeedbackMessage(t('auth.errors.passwordMismatch'))
      return
    }

    try {
      if (isSignUp) {
        const result = await signUp({
          name: formState.name,
          email: formState.email,
          password: formState.password,
        }).unwrap()

        if (result.token) {
          dispatch(setCredentials(result))
          navigate('/dashboard', { replace: true })
          return
        }

        navigate('/login', {
          replace: true,
          state: { successMessage: t('auth.success.accountCreated') },
        })
        return
      }

      const result = await signIn({
        email: formState.email,
        password: formState.password,
      }).unwrap()

      dispatch(setCredentials(result))
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setFeedbackType('error')
      setFeedbackMessage(
        getErrorMessage(error, t('auth.errors.unexpectedResponse')),
      )
    }
  }

  const title = isSignUp ? t('auth.signUpTitle') : t('auth.loginTitle')
  const subtitle = isSignUp ? t('auth.signUpSubtitle') : t('auth.loginSubtitle')
  const alternatePath = isSignUp ? '/login' : '/sign-up'
  const alternateLabel = isSignUp ? t('auth.haveAccount') : t('auth.needAccount')
  const alternateAction = isSignUp ? t('nav.login') : t('nav.signUp')

  return (
    <Card
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <Header>
        <CardEyebrow>{t('auth.badge')}</CardEyebrow>
        <CardTitle>{title}</CardTitle>
        <CardSubtitle>{subtitle}</CardSubtitle>
      </Header>

      <Form onSubmit={handleSubmit}>
        {isSignUp ? (
          <FieldLabel>
            <span>{t('auth.fields.name')}</span>
            <FieldInput>
              <FiUser />
              <input
                type="text"
                name="name"
                placeholder={t('auth.placeholders.name')}
                value={formState.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </FieldInput>
          </FieldLabel>
        ) : null}

        <FieldLabel>
          <span>{t('auth.fields.email')}</span>
          <FieldInput>
            <FiMail />
            <input
              type="email"
              name="email"
              placeholder={t('auth.placeholders.email')}
              value={formState.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </FieldInput>
        </FieldLabel>

        <FieldLabel>
          <span>{t('auth.fields.password')}</span>
          <FieldInput>
            <FiLock />
            <input
              type="password"
              name="password"
              placeholder={t('auth.placeholders.password')}
              value={formState.password}
              onChange={handleChange}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              required
            />
          </FieldInput>
        </FieldLabel>

        {isSignUp ? (
          <FieldLabel>
            <span>{t('auth.fields.confirmPassword')}</span>
            <FieldInput>
              <FiLock />
              <input
                type="password"
                name="confirmPassword"
                placeholder={t('auth.placeholders.confirmPassword')}
                value={formState.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </FieldInput>
          </FieldLabel>
        ) : null}

        {feedbackMessage ? (
          <Feedback $type={feedbackType}>{feedbackMessage}</Feedback>
        ) : null}

        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? <Spin><FiLoader /></Spin> : <FiArrowRight />}
          <span>
            {isSignUp ? t('auth.actions.createAccount') : t('auth.actions.login')}
          </span>
        </SubmitButton>
      </Form>

      <Footer>
        {alternateLabel} <Link to={alternatePath}>{alternateAction}</Link>
      </Footer>
    </Card>
  )
}