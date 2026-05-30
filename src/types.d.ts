declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "@payloadcms/next/css";

declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}
