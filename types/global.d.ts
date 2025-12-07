// Type declarations for non-standard file extensions
declare module "*.jss" {
  const content: any;
  export default content;
}

declare module "*?jss" {
  const content: any;
  export default content;
}
