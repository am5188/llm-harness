declare module "*.mdx" {
  const MDXComponent: (props: {
    components?: Record<string, import("react").ComponentType>;
  }) => import("react").JSX.Element;
  export default MDXComponent;
  export const meta: import("@/lib/chapters").ChapterMeta;
}
