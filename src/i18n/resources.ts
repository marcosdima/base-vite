type Translation = Record<string, unknown>;

export interface Resources {
  en: { translation: Translation };
  es: { translation: Translation };
}

export const resources: Resources = {
  en: {
    translation: {
      nav: {
        home: 'Home',
        dashboard: 'Dashboard',
        login: 'Log in',
        signIn: 'Sign in',
      },
      layout: {
        brand: 'App',
        ready: 'Ready to ship',
        primaryNavigation: 'Primary navigation',
        logout: 'Log out',
        languageSwitcher: 'Language switcher',
      },
      notFound: {
        title: 'Page not found',
        description: 'The route you requested does not exist in this starter.',
        action: 'Go back home',
      },
      home: {
        badge: 'Reusable Vite baseline',
        title: 'Start new React projects without rebuilding the same foundation every time.',
        description:
          'This starter already includes routing, Redux Toolkit, RTK Query, i18n, motion animations, icons, and auth-ready screens.',
        primaryAction: 'Create account',
        secondaryAction: 'Open login',
        stackTitle: 'Included stack',
        stackItems: [
          'React 19',
          'React Router v7',
          'Redux Toolkit',
          'RTK Query',
          'i18next',
          'Motion',
          'react-icons',
          'Axios',
        ],
        featureCards: [
          {
            title: 'Application structure',
            description:
              'App shell, pages, features, services, and routing are already separated to scale cleanly.',
          },
          {
            title: 'REST API workflow',
            description:
              'RTK Query mutations and queries are connected to an Axios client with auth header support.',
          },
          {
            title: 'Bilingual UI',
            description:
              'English and Spanish strings are configured and the language toggle is already mounted.',
          },
          {
            title: 'Auth baseline',
            description:
              'Log in, sign up, session persistence, and protected routes are ready for your backend.',
          },
        ],
        simpleTitle: 'Home',
        simpleDescription: 'Start building here.',
      },
      auth: {
        badge: 'Authentication template',
        loginTitle: 'Welcome back',
        loginSubtitle: 'Use your backend credentials to enter the protected dashboard.',
        signInTitle: 'Create your account',
        signInSubtitle: 'This form is wired to a REST endpoint and ready to adapt to your API.',
        haveAccount: 'Already have an account?',
        needAccount: 'Need an account?',
        fields: {
          username: 'Username',
          password: 'Password',
          confirmPassword: 'Confirm password',
        },
        placeholders: {
          username: 'jane_doe',
          password: 'Enter your password',
          confirmPassword: 'Repeat your password',
        },
        actions: {
          login: 'Log in',
          createAccount: 'Create account',
        },
        success: {
          accountCreated: 'Account created successfully. Please log in with your new credentials.',
        },
        errors: {
          passwordMismatch: 'Passwords must match before sending the request.',
          unexpectedResponse: 'The server returned an unexpected response.',
        },
      },
      dashboard: {
        badge: 'Protected route',
        title: 'Dashboard connected to the store and API layer',
        greeting: 'Hi, {{username}}!',
        greetingFallback: 'there',
        baseDescription: 'This dashboard is the base for testing and mounting the next features.',
        sessionTokenLabel: 'Session token',
        noToken: 'No token',
        showcaseTitle: 'Features',
        showcase: {
          theme: 'Theme',
          poll: 'Poll',
          groupInput: 'Grouped input',
        },
        pollExample: {
          question: 'Which feature should we build next?',
          optionA: 'Reports dashboard',
          optionB: 'Real-time notifications',
          optionC: 'Export to CSV',
          close: 'Close poll',
          reset: 'Reset votes',
        },
        groupInput: {
          hint: 'Drag keys from one group to another.',
          empty: 'No keys in this group.',
          defaultGroupA: 'Group A',
          defaultGroupB: 'Group B',
          groupAAria: 'Group A name',
          groupBAria: 'Group B name',
        },
        description:
          'Use this page as a starting point for private modules that need authenticated data.',
        name: 'Current user',
        fallbackUser: 'Authenticated user',
        apiCardTitle: 'REST base URL',
        apiCardDescription:
          'Change this value using VITE_API_URL to point the template to your backend.',
        sessionCardTitle: 'Session token',
        sessionCardDescription:
          'The token is persisted in localStorage and attached automatically to every request.',
        profileRequestFailed: 'Failed to fetch profile. Check your endpoint or token.',
        refresh: 'Refresh profile',
        refreshing: 'Refreshing...',
      },
    },
  },
  es: {
    translation: {
      nav: {
        home: 'Inicio',
        dashboard: 'Panel',
        login: 'Ingresar',
        signIn: 'Crear cuenta',
      },
      layout: {
        brand: 'App',
        ready: 'Listo para enviar',
        primaryNavigation: 'Navegación principal',
        logout: 'Cerrar sesión',
        languageSwitcher: 'Cambiar idioma',
      },
      notFound: {
        title: 'Página no encontrada',
        description: 'La ruta que solicitaste no existe en este starter.',
        action: 'Volver al inicio',
      },
      home: {
        badge: 'Base reutilizable de Vite',
        title: 'Empezá nuevos proyectos React sin reconstruir la misma base cada vez.',
        description:
          'Este starter ya incluye routing, Redux Toolkit, RTK Query, i18n, animaciones de Motion, iconos y pantallas de auth listas.',
        primaryAction: 'Crear cuenta',
        secondaryAction: 'Abrir login',
        stackTitle: 'Stack incluido',
        stackItems: [
          'React 19',
          'React Router v7',
          'Redux Toolkit',
          'RTK Query',
          'i18next',
          'Motion',
          'react-icons',
          'Axios',
        ],
        featureCards: [
          {
            title: 'Estructura de aplicación',
            description:
              'App shell, páginas, features, servicios y routing ya están separados para escalar limpiamente.',
          },
          {
            title: 'Flujo de API REST',
            description:
              'Las mutaciones y consultas de RTK Query están conectadas a un cliente Axios con soporte de headers de auth.',
          },
          {
            title: 'UI bilingüe',
            description: 'Inglés y español configurados, y el selector de idioma ya está montado.',
          },
          {
            title: 'Base de autenticación',
            description:
              'Login, registro, persistencia de sesión y rutas protegidas listas para tu backend.',
          },
        ],
        simpleTitle: 'Inicio',
        simpleDescription: 'Empezá a construir desde acá.',
      },
      auth: {
        badge: 'Plantilla de autenticación',
        loginTitle: 'Bienvenido otra vez',
        loginSubtitle: 'Usá las credenciales de tu backend para entrar al panel protegido.',
        signInTitle: 'Creá tu cuenta',
        signInSubtitle:
          'Este formulario ya está conectado a un endpoint REST y listo para adaptar a tu API.',
        haveAccount: '¿Ya tenés cuenta?',
        needAccount: '¿Necesitás una cuenta?',
        fields: {
          username: 'Nombre de usuario',
          password: 'Contraseña',
          confirmPassword: 'Confirmar contraseña',
        },
        placeholders: {
          username: 'juana_perez',
          password: 'Ingresá tu contraseña',
          confirmPassword: 'Repetí tu contraseña',
        },
        actions: {
          login: 'Ingresar',
          createAccount: 'Crear cuenta',
        },
        success: {
          accountCreated:
            'La cuenta se creó correctamente. Ahora ingresá con tus credenciales nuevas.',
        },
        errors: {
          passwordMismatch: 'Las contraseñas deben coincidir antes de enviar la solicitud.',
          unexpectedResponse: 'El servidor devolvió una respuesta inesperada.',
        },
      },
      dashboard: {
        badge: 'Ruta protegida',
        title: 'Panel conectado al store y a la capa de API',
        greeting: 'Hola, {{username}}!',
        greetingFallback: 'amigo',
        baseDescription:
          'Este dashboard es la base para probar e ir montando las próximas features.',
        sessionTokenLabel: 'Token de sesión',
        noToken: 'Sin token',
        showcaseTitle: 'Features',
        showcase: {
          theme: 'Tema',
          poll: 'Encuesta',
          groupInput: 'Input agrupado',
        },
        pollExample: {
          question: 'Qué feature deberíamos construir ahora?',
          optionA: 'Dashboard de reportes',
          optionB: 'Notificaciones en tiempo real',
          optionC: 'Exportar a CSV',
          close: 'Cerrar encuesta',
          reset: 'Reiniciar votos',
        },
        groupInput: {
          hint: 'Arrastrá claves de un grupo al otro.',
          empty: 'No hay claves en este grupo.',
          defaultGroupA: 'Grupo A',
          defaultGroupB: 'Grupo B',
          groupAAria: 'Nombre del grupo A',
          groupBAria: 'Nombre del grupo B',
        },
        description:
          'Usá esta página como punto de partida para módulos privados que necesiten datos autenticados.',
        name: 'Usuario actual',
        fallbackUser: 'Usuario autenticado',
        apiCardTitle: 'URL base REST',
        apiCardDescription:
          'Cambiá este valor usando VITE_API_URL para apuntar la plantilla a tu backend.',
        sessionCardTitle: 'Token de sesión',
        sessionCardDescription:
          'El token se persiste en localStorage y se adjunta automáticamente a cada request.',
        profileRequestFailed: 'Falló la consulta del perfil. Revisá tu endpoint o el token.',
        refresh: 'Actualizar perfil',
        refreshing: 'Actualizando...',
      },
    },
  },
};
