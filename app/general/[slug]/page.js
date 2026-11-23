import { notFound } from "next/navigation";
import SettingsList from "@/components/SettingsList";
import { CustomizerPath, NextCard, PageHeader, Screenshot } from "@/components/PageShell";
import { getThemeSettingGroup, neighbours, theme, themeSettingGroups } from "@/lib/manual";
import { generalScreenshot } from "@/lib/screenshots";

export function generateStaticParams() {
  return themeSettingGroups.map((group) => ({ slug: group.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const group = getThemeSettingGroup(slug);
  if (!group) return {};
  return {
    title: group.title,
    description: `${group.title} settings for the ${theme.name} Shopify theme.`,
  };
}

export default async function ThemeSettingPage({ params }) {
  const { slug } = await params;
  const group = getThemeSettingGroup(slug);
  if (!group) notFound();

  const { previous, next } = neighbours(`/general/${slug}`);

  return (
    <article>
      <PageHeader
        group="General"
        title={group.title}
        lead={`These are the store-wide ${group.title.toLowerCase()} settings. They apply everywhere in the theme, so changing one here updates every section that uses it.`}
      />

      <CustomizerPath steps={["Customizer", "Theme settings", group.title]} />
      <Screenshot
        src={generalScreenshot(group)}
        alt={`The ${group.title} panel in Theme settings`}
      />

      <h2 className="mt-12 text-2xl font-black tracking-tight">Settings</h2>
      <SettingsList groups={group.groups} />

      <NextCard previous={previous} next={next} />
    </article>
  );
}
