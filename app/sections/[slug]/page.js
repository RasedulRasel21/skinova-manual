import { notFound } from "next/navigation";
import SettingsList from "@/components/SettingsList";
import { CustomizerPath, NextCard, PageHeader, Screenshot } from "@/components/PageShell";
import { getSection, hasScreenshots, neighbours, sections, theme } from "@/lib/manual";
import { sectionAdding, sectionPreview } from "@/lib/screenshots";

export function generateStaticParams() {
  return sections.map((section) => ({ slug: section.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const section = getSection(slug);
  if (!section) return {};
  return {
    title: section.title,
    description: `How to add and customize the ${section.title} section in the ${theme.name} Shopify theme.`,
  };
}

export default async function SectionPage({ params }) {
  const { slug } = await params;
  const section = getSection(slug);
  if (!section) notFound();

  const { previous, next } = neighbours(`/sections/${slug}`);
  const groupLabel = section.addable ? "Sections" : "Template sections";

  const lead = section.addable
    ? `The ${section.title} section can be added to any page from the theme editor, as many times as you need.`
    : `The ${section.title} section is built into the template it belongs to. It can't be added from the section picker — open that template to edit it.`;

  return (
    <article>
      <PageHeader group={groupLabel} title={section.title} lead={lead} />

      {/* Only addable sections get imagery. Template sections are explained
          in words: a merchant reaches them through the template, not the picker. */}
      {hasScreenshots(section) && (
        <Screenshot
          src={sectionPreview(section)}
          alt={`The ${section.title} section on a storefront`}
        />
      )}

      <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
        {[
          ["Settings", section.settingCount],
          ["Blocks", section.blocks.length || "—"],
          ["Block settings", section.blockSettingCount || "—"],
          ["Max blocks", section.maxBlocks ?? "—"],
        ].map(([label, value]) => (
          <div key={label} className="bg-paper px-4 py-3">
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="mt-0.5 font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      {section.addable ? (
        <section aria-labelledby="adding">
          <h2 id="adding" className="mt-14 text-2xl font-black tracking-tight">
            Adding the section
          </h2>
          <ol className="mt-4 space-y-2 text-[15px] leading-relaxed text-muted-strong">
            <li className="flex gap-3">
              <span className="select-none text-muted tabular-nums">1.</span>
              <span>
                In the theme editor, click <strong>Add section</strong> on the page
                you want it on.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="select-none text-muted tabular-nums">2.</span>
              <span>
                Search for <strong>{section.title}</strong>.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="select-none text-muted tabular-nums">3.</span>
              <span>
                Click the result to drop it into the page, then drag it into
                position.
              </span>
            </li>
          </ol>
          <CustomizerPath
            lead="In short, go to"
            steps={["Customizer", "Add section", section.title]}
          />
          {hasScreenshots(section) && (
            <Screenshot
              src={sectionAdding(section)}
              alt={`Adding the ${section.title} section in the theme editor`}
              optional
            />
          )}
        </section>
      ) : (
        <section aria-labelledby="finding">
          <h2 id="finding" className="mt-14 text-2xl font-black tracking-tight">
            Setting it up
          </h2>

          {section.usedIn.length > 0 ? (
            <>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-strong">
                This section is already part of{" "}
                {section.usedIn.length === 1 ? "the " : "these templates: "}
                {section.usedIn.map((name, i) => (
                  <span key={name}>
                    {i > 0 && ", "}
                    <code className="rounded bg-chip px-1.5 py-0.5 font-mono text-[13px] text-foreground">
                      {name}
                    </code>
                  </span>
                ))}
                {section.usedIn.length === 1 ? " template." : "."} You don&apos;t
                add it — it appears automatically on those pages.
              </p>
              <ol className="mt-4 space-y-2 text-[15px] leading-relaxed text-muted-strong">
                <li className="flex gap-3">
                  <span className="select-none text-muted tabular-nums">1.</span>
                  <span>
                    In the theme editor, open that template from the page
                    selector at the top of the screen.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="select-none text-muted tabular-nums">2.</span>
                  <span>
                    Click <strong>{section.title}</strong> in the left-hand list
                    to open its settings.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="select-none text-muted tabular-nums">3.</span>
                  <span>
                    Adjust the settings below. There is no{" "}
                    <strong>Add section</strong> entry for it, and it can&apos;t
                    be removed or placed on another page.
                  </span>
                </li>
              </ol>
            </>
          ) : section.renderedInLayout ? (
            <>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-strong">
                This section is rendered by the theme layout rather than by a
                template, so it is available on every page of the store.
              </p>
              <ol className="mt-4 space-y-2 text-[15px] leading-relaxed text-muted-strong">
                <li className="flex gap-3">
                  <span className="select-none text-muted tabular-nums">1.</span>
                  <span>
                    Open any page in the theme editor — it doesn&apos;t matter
                    which.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="select-none text-muted tabular-nums">2.</span>
                  <span>
                    Find <strong>{section.title}</strong> in the left-hand list
                    and click it to open its settings.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="select-none text-muted tabular-nums">3.</span>
                  <span>
                    If it isn&apos;t listed, a theme setting is switching it off.
                    Check <strong>Theme settings</strong> first.
                  </span>
                </li>
              </ol>
            </>
          ) : (
            <p className="mt-4 text-[15px] leading-relaxed text-muted-strong">
              This section is never placed on a page. The theme renders it inside
              other sections and refreshes it in the background as the cart
              changes, so there is nothing to add or position in the theme
              editor. Its settings below still apply wherever it appears.
            </p>
          )}
        </section>
      )}

      {section.acceptsAppBlocks && (
        <p className="mt-6 rounded-lg bg-tint px-4 py-3 text-[15px] text-muted-strong">
          This section accepts app blocks, so you can add blocks from installed
          apps alongside the theme&apos;s own.
        </p>
      )}

      <h2 className="mt-14 text-2xl font-black tracking-tight">Settings</h2>
      <SettingsList
        groups={section.groups}
        emptyMessage="This section has no settings of its own — everything is configured through its blocks."
      />

      {section.blocks.length > 0 && (
        <>
          <h2 className="mt-14 text-2xl font-black tracking-tight">Blocks</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-strong">
            Blocks are the repeatable items inside this section. Add, reorder and
            remove them from the section&apos;s panel in the theme editor
            {section.maxBlocks ? `, up to ${section.maxBlocks}` : ""}.
          </p>
          {section.blocks.map((block) => (
            <div key={block.type} className="mt-10 border-t border-line pt-8">
              <h3 className="text-xl font-semibold">{block.name}</h3>
              <SettingsList
                groups={block.groups}
                headingLevel={4}
                emptyMessage="This block has no settings."
              />
            </div>
          ))}
        </>
      )}

      <NextCard previous={previous} next={next} />
    </article>
  );
}
