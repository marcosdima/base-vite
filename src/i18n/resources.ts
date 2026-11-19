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
        playground: 'Playground',
        dashboard: 'Dashboard',
        login: 'Log in',
        signIn: 'Sign in',
      },
      layout: {
        primaryNavigation: 'Primary navigation',
        logout: 'Log out',
        languageSwitcher: 'Language switcher',
        toggleTheme: 'Toggle theme',
      },
      notFound: {
        title: 'Page not found',
        description: 'The route you requested does not exist in this starter.',
        action: 'Go back home',
      },
      errorBoundary: {
        badge: 'Unexpected error',
        title: 'Something went wrong',
        description: 'An unexpected error interrupted rendering. You can retry or go back home.',
        retry: 'Try again',
        home: 'Go back home',
      },
      home: {
        title: 'Home',
        description: 'Start building here.',
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
        greeting: 'Hi, {{username}}!',
        greetingFallback: 'there',
        description:
          'Use this page as a starting point for private modules that need authenticated data.',
        name: 'Current user',
        fallbackUser: 'Authenticated user',
        sessionTokenLabel: 'Session token',
        noToken: 'No token',
        apiCardTitle: 'REST base URL',
        profileRequestFailed: 'Failed to fetch profile. Check your endpoint or token.',
        refresh: 'Refresh profile',
        refreshing: 'Refreshing...',
      },
      playground: {
        badge: 'Visual Testing',
        title: 'Visual Testing Playground',
        subtitle:
          'Inspect theme tokens, core UI primitives, and general-purpose widgets in both light and dark modes.',
        sections: {
          tokens: 'Design Tokens',
          primitives: 'UI Primitives',
          widgets: 'General-Purpose Widgets',
        },
        primitives: {
          buttons: 'Button variants and states',
          primaryAction: 'Primary',
          secondaryAction: 'Secondary',
          ghostAction: 'Ghost',
          dangerAction: 'Danger',
          loadingAction: 'Loading',
          disabledAction: 'Disabled',
          inputs: 'Input states',
          inputLabel: 'Search query',
          inputPlaceholder: 'Type to test focus and value...',
          inputHint: 'Supports icons, hints, and accessible validation messages.',
          errorInputLabel: 'Field with error',
          errorInputMessage: 'Please provide a valid value.',
          badgesAndCards: 'Badges and nested cards',
          elevatedCardNote: 'Elevated card surface with theme border and shadow.',
        },
        spotlight: {
          primitivesTitle: 'Core UI Primitives',
          primitivesDescription: 'Token-driven Button, Input, Card, Badge, and Stack components.',
          terminalTitle: 'Interactive Terminal',
          terminalDescription: 'Extensible CLI widget with command history and custom handlers.',
          boardTitle: 'Protected Dashboard',
          boardDescription: 'Authenticated route connected to Redux Toolkit and RTK Query.',
          cta: 'Open section',
        },
        widgets: {
          poll: 'Poll widget',
          groupInput: 'Grouped drag-and-drop input',
        },
      },
      widgets: {
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
      },
    },
  },
  es: {
    translation: {
      nav: {
        home: 'Inicio',
        playground: 'Playground',
        dashboard: 'Panel',
        login: 'Ingresar',
        signIn: 'Crear cuenta',
      },
      layout: {
        primaryNavigation: 'Navegación principal',
        logout: 'Cerrar sesión',
        languageSwitcher: 'Cambiar idioma',
        toggleTheme: 'Cambiar tema',
      },
      notFound: {
        title: 'Página no encontrada',
        description: 'La ruta que solicitaste no existe en este starter.',
        action: 'Volver al inicio',
      },
      errorBoundary: {
        badge: 'Error inesperado',
        title: 'Algo salió mal',
        description: 'Ocurrió un error inesperado al renderizar. Podés reintentar o volver.',
        retry: 'Reintentar',
        home: 'Volver al inicio',
      },
      home: {
        title: 'Inicio',
        description: 'Empezá a construir desde acá.',
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
        greeting: 'Hola, {{username}}!',
        greetingFallback: 'amigo',
        description:
          'Usá esta página como punto de partida para módulos privados que necesiten datos autenticados.',
        name: 'Usuario actual',
        fallbackUser: 'Usuario autenticado',
        sessionTokenLabel: 'Token de sesión',
        noToken: 'Sin token',
        apiCardTitle: 'URL base REST',
        profileRequestFailed: 'Falló la consulta del perfil. Revisá tu endpoint o el token.',
        refresh: 'Actualizar perfil',
        refreshing: 'Actualizando...',
      },
      playground: {
        badge: 'Testing visual',
        title: 'Playground de Testing Visual',
        subtitle:
          'Inspeccioná tokens de diseño, primitivas UI y widgets de propósito general en modo claro y oscuro.',
        sections: {
          tokens: 'Tokens de diseño',
          primitives: 'Primitivas UI',
          widgets: 'Widgets de propósito general',
        },
        primitives: {
          buttons: 'Variantes y estados de Button',
          primaryAction: 'Primario',
          secondaryAction: 'Secundario',
          ghostAction: 'Ghost',
          dangerAction: 'Peligro',
          loadingAction: 'Cargando',
          disabledAction: 'Deshabilitado',
          inputs: 'Estados de Input',
          inputLabel: 'Búsqueda',
          inputPlaceholder: 'Escribí para probar foco y valor...',
          inputHint: 'Soporta iconos, hints y mensajes de validación accesibles.',
          errorInputLabel: 'Campo con error',
          errorInputMessage: 'Ingresá un valor válido.',
          badgesAndCards: 'Badges y cards anidadas',
          elevatedCardNote: 'Card elevada con borde y sombra del tema.',
        },
        spotlight: {
          primitivesTitle: 'Primitivas UI base',
          primitivesDescription: 'Button, Input, Card, Badge y Stack guiados por tokens.',
          terminalTitle: 'Terminal interactivo',
          terminalDescription: 'Widget CLI extensible con historial y comandos propios.',
          boardTitle: 'Panel protegido',
          boardDescription: 'Ruta autenticada conectada a Redux Toolkit y RTK Query.',
          cta: 'Abrir sección',
        },
        widgets: {
          poll: 'Widget de encuesta',
          groupInput: 'Input agrupado con drag-and-drop',
        },
      },
      widgets: {
        pollExample: {
          question: '¿Qué feature deberíamos construir ahora?',
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
      },
    },
  },
};
