/// <reference types="astro/client" />
/// <reference types="vue/macros-global" />

interface ImportMetaEnv {
  readonly PUBLIC_BACKEND_SERVER: string
  readonly SITE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
