import { useState } from 'react'
import { FiArrowRight, FiLoader, FiLock, FiUser } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { setCredentials } from '../../features/auth/authSlice'
import { useLoginMutation, useSignInMutation } from '../../services/authApi'
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
  username: '',
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
  const [login, loginResult] = useLoginMutation()
  const [signIn, signInResult] = useSignInMutation()

  const isSignIn = mode === 'signin'
  const isLoading = loginResult.isLoading || signInResult.isLoading
  const redirectTo = location.state?.redirectTo ?? '/dashboard'

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

    if (isSignIn && formState.password !== formState.confirmPassword) {
      setFeedbackType('error')
      setFeedbackMessage(t('auth.errors.passwordMismatch'))
      return
    }

    try {
      if (isSignIn) {
        const result = await signIn({
          username: formState.username,
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

      const result = await login({
        username: formState.username,
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

  const title = isSignIn ? t('auth.signInTitle') : t('auth.loginTitle')
  const subtitle = isSignIn ? t('auth.signInSubtitle') : t('auth.loginSubtitle')
  const alternatePath = isSignIn ? '/login' : '/signin'
  const alternateLabel = isSignIn ? t('auth.haveAccount') : t('auth.needAccount')
  const alternateAction = isSignIn ? t('nav.login') : t('nav.signIn')

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
        <FieldLabel>
          <span>{t('auth.fields.username')}</span>
          <FieldInput>
            <FiUser />
            <input
              type="text"
              name="username"
              placeholder={t('auth.placeholders.username')}
              value={formState.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </FieldInput>
        </FieldLabel>

        {isSignIn ? (
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
              autoComplete={isSignIn ? 'new-password' : 'current-password'}
              required
            />
          </FieldInput>
        </FieldLabel>

        {feedbackMessage ? (
          <Feedback $type={feedbackType}>{feedbackMessage}</Feedback>
        ) : null}

        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? <Spin><FiLoader /></Spin> : <FiArrowRight />}
          <span>
            {isSignIn ? t('auth.actions.createAccount') : t('auth.actions.login')}
          </span>
        </SubmitButton>
      </Form>

      <Footer>
        {alternateLabel} <Link to={alternatePath}>{alternateAction}</Link>
      </Footer>
    </Card>
  )
}