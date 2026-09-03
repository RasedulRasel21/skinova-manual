import { formatDefault, typeLabel } from "@/lib/manual";

/**
 * One settings group, rendered the way a merchant reads it: the group's name
 * from the Customizer, then a numbered list of its controls. Names, types,
 * defaults and help text all come from the theme schema, so this can't drift
 * out of sync with what the merchant actually sees.
 */
function Group({ group, index, headingLevel }) {
  const headingId = `group-${index}`;
  // Block settings nest one level deeper than section settings, so the group
  // heading has to shift with them or the document outline breaks.
  const Heading = headingLevel === 4 ? "h4" : "h3";

  return (
    <section className="mt-10 first:mt-8" aria-labelledby={headingId}>
      {group.title && (
        <Heading id={headingId} className="text-lg font-semibold">
          {group.title}
        </Heading>
      )}

      <ol className="mt-4 space-y-3">
        {group.settings.map((setting) => {
          const fallback = formatDefault(setting);
          return (
            <li key={setting.id ?? setting.label} className="flex gap-3 text-[15px] leading-relaxed">
              <span className="select-none pt-px text-muted tabular-nums">
                {group.settings.indexOf(setting) + 1}.
              </span>
              <span>
                <code className="rounded bg-code-bg px-1.5 py-0.5 font-mono text-[13px]">
                  {setting.label ?? setting.id}
                </code>{" "}
                <span className="text-muted-strong">— {typeLabel(setting.type)}</span>
                {setting.info && <span className="text-muted-strong">. {setting.info}</span>}
                {fallback && (
                  <span className="text-muted">
                    {" "}
                    Default: <span className="font-medium text-muted-strong">{fallback}</span>.
                  </span>
                )}
                {setting.type === "range" && setting.range && (
                  <span className="text-muted">
                    {" "}
                    Range {setting.range.min}–{setting.range.max}
                    {setting.unit ?? ""} in steps of {setting.range.step}
                    {setting.unit ?? ""}.
                  </span>
                )}
                {setting.options && (
                  <span className="text-muted">
                    {" "}
                    Options: {setting.options.map((o) => o.label).join(", ")}.
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default function SettingsList({
  groups,
  headingLevel = 3,
  emptyMessage = "This section has no settings.",
}) {
  if (!groups?.length) {
    return <p className="mt-6 text-[15px] text-muted-strong">{emptyMessage}</p>;
  }
  return groups.map((group, i) => (
    <Group key={group.title ?? i} group={group} index={i} headingLevel={headingLevel} />
  ));
}
