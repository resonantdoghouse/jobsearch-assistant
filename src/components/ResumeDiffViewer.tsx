import { diffWords } from "diff";
import { ResumeData } from "./ResumePreview";
import React, { Fragment } from "react";

interface ResumeDiffViewerProps {
  oldData: ResumeData;
  newData: ResumeData;
}

export function ResumeDiffViewer({ oldData, newData }: ResumeDiffViewerProps) {
  return (
    <div className="space-y-8 font-sans text-sm">
      <DiffSection title="Contact Info">
        <div className="grid grid-cols-2 gap-4">
          <DiffField
            label="Full Name"
            oldValue={oldData.fullName}
            newValue={newData.fullName}
          />
          <DiffField
            label="Email"
            oldValue={oldData.contactInfo.email}
            newValue={newData.contactInfo.email}
          />
          <DiffField
            label="Phone"
            oldValue={oldData.contactInfo.phone}
            newValue={newData.contactInfo.phone}
          />
          <DiffField
            label="Location"
            oldValue={oldData.contactInfo.location}
            newValue={newData.contactInfo.location}
          />
          <DiffField
            label="LinkedIn"
            oldValue={oldData.contactInfo.linkedin || ""}
            newValue={newData.contactInfo.linkedin || ""}
          />
          <DiffField
            label="Website"
            oldValue={oldData.contactInfo.website || ""}
            newValue={newData.contactInfo.website || ""}
          />
        </div>
      </DiffSection>

      <DiffSection title="Professional Summary">
        <DiffText oldValue={oldData.summary} newValue={newData.summary} />
      </DiffSection>

      <DiffSection title="Skills">
        <div className="space-y-2">
          <DiffList
            label="Languages"
            oldList={oldData.skills.languages}
            newList={newData.skills.languages}
          />
          <DiffList
            label="Frameworks"
            oldList={oldData.skills.frameworks}
            newList={newData.skills.frameworks}
          />
          <DiffList
            label="Tools"
            oldList={oldData.skills.tools}
            newList={newData.skills.tools}
          />
        </div>
      </DiffSection>

      <DiffSection title="Experience">
        <DiffArray
          oldArray={oldData.experience}
          newArray={newData.experience}
          keyFn={(item) => item.company + item.role}
          renderItem={(item, status) => (
            <div className={`p-3 rounded border ${getStatusColor(status)}`}>
              <div className="flex justify-between font-bold mb-1">
                <span>
                  {item.role} at {item.company}
                </span>
                <span>{item.duration}</span>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                {item.description.map((desc, i) => (
                  <li key={i}>{desc}</li>
                ))}
              </ul>
            </div>
          )}
          renderDiff={(oldItem, newItem) => (
            <div className="space-y-2 p-3 rounded border border-yellow-200 bg-yellow-50">
              <div className="flex justify-between font-bold mb-1">
                <div className="flex flex-col">
                  <DiffField
                    label="Role"
                    oldValue={oldItem.role}
                    newValue={newItem.role}
                    inline
                  />
                  <DiffField
                    label="Company"
                    oldValue={oldItem.company}
                    newValue={newItem.company}
                    inline
                  />
                </div>
                <DiffField
                  label="Duration"
                  oldValue={oldItem.duration}
                  newValue={newItem.duration}
                  inline
                />
              </div>
              <div className="mt-2">
                <p className="text-xs font-semibold text-gray-500 mb-1">
                  Description Updates:
                </p>
                <DiffList
                  label=""
                  oldList={oldItem.description}
                  newList={newItem.description}
                />
              </div>
            </div>
          )}
        />
      </DiffSection>

      <DiffSection title="Projects">
        <DiffArray
          oldArray={oldData.projects || []}
          newArray={newData.projects || []}
          keyFn={(item) => item.name}
          renderItem={(item, status) => (
            <div className={`p-3 rounded border ${getStatusColor(status)}`}>
              <div className="flex justify-between font-bold mb-1">
                <span>{item.name}</span>
                <span className="text-xs font-normal text-gray-600">
                  [{item.techStack.join(", ")}]
                </span>
              </div>
              <p>{item.description}</p>
            </div>
          )}
          renderDiff={(oldItem, newItem) => (
            <div className="space-y-2 p-3 rounded border border-yellow-200 bg-yellow-50">
              <div className="flex justify-between font-bold mb-1">
                <DiffField
                  label="Name"
                  oldValue={oldItem.name}
                  newValue={newItem.name}
                  inline
                />
                <div className="text-xs font-normal text-gray-600">
                  <DiffList
                    label="Stack"
                    oldList={oldItem.techStack}
                    newList={newItem.techStack}
                  />
                </div>
              </div>
              <DiffText
                oldValue={oldItem.description}
                newValue={newItem.description}
              />
            </div>
          )}
        />
      </DiffSection>

      <DiffSection title="Education">
        <DiffArray
          oldArray={oldData.education}
          newArray={newData.education}
          keyFn={(item) => item.school + item.degree}
          renderItem={(item, status) => (
            <div className={`p-3 rounded border ${getStatusColor(status)}`}>
              <div className="flex justify-between font-bold mb-1">
                <span>{item.school}</span>
                <span>{item.year}</span>
              </div>
              <p>{item.degree}</p>
            </div>
          )}
          renderDiff={(oldItem, newItem) => (
            <div className="space-y-2 p-3 rounded border border-yellow-200 bg-yellow-50">
              <div className="flex justify-between font-bold mb-1">
                <DiffField
                  label="School"
                  oldValue={oldItem.school}
                  newValue={newItem.school}
                  inline
                />
                <DiffField
                  label="Year"
                  oldValue={oldItem.year}
                  newValue={newItem.year}
                  inline
                />
              </div>
              <DiffField
                label="Degree"
                oldValue={oldItem.degree}
                newValue={newItem.degree}
                inline
              />
            </div>
          )}
        />
      </DiffSection>
    </div>
  );
}

// --- Helper Components ---

function DiffSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

function DiffField({
  label,
  oldValue,
  newValue,
  inline = false,
}: {
  label: string;
  oldValue: string;
  newValue: string;
  inline?: boolean;
}) {
  if (oldValue === newValue) {
    return (
      <div className={inline ? "inline-block mr-4" : ""}>
        {label && (
          <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold mr-2">
            {label}:
          </span>
        )}
        <span className="text-gray-900">{newValue}</span>
      </div>
    );
  }

  return (
    <div className={inline ? "inline-block mr-4" : ""}>
      {label && (
        <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold mr-2">
          {label}:
        </span>
      )}
      <DiffText oldValue={oldValue} newValue={newValue} />
    </div>
  );
}

function DiffText({
  oldValue,
  newValue,
}: {
  oldValue: string;
  newValue: string;
}) {
  const diffs = diffWords(oldValue || "", newValue || "");
  return (
    <span className="leading-relaxed">
      {diffs.map((part, i) => {
        const color = part.added
          ? "bg-green-100 text-green-800"
          : part.removed
            ? "bg-red-100 text-red-800 line-through decoration-red-500 decoration-2"
            : "text-gray-700";
        return (
          <span key={i} className={`rounded px-0.5 ${color}`}>
            {part.value}
          </span>
        );
      })}
    </span>
  );
}

function DiffList({
  label,
  oldList,
  newList,
}: {
  label: string;
  oldList: string[];
  newList: string[];
}) {
  // Simple array diff for strings
  // We can just diff the joined strings for a simple view, or smart diff.
  // For simplicity in lists, we'll diff the joined content to show changes clearly in one line usually.
  // Or we can show removed items and added items.

  // Let's do set-based diff for lists of tags/skills
  const oldSet = new Set(oldList);
  const newSet = new Set(newList);

  const kept = oldList.filter((x) => newSet.has(x));
  const added = newList.filter((x) => !oldSet.has(x));
  const removed = oldList.filter((x) => !newSet.has(x));

  if (added.length === 0 && removed.length === 0) {
    return (
      <div className="flex flex-wrap gap-2 items-center">
        {label && (
          <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold w-24 shrink-0">
            {label}:
          </span>
        )}
        {oldList.map((item) => (
          <span
            key={item}
            className="px-2 py-1 bg-gray-100 rounded text-gray-700"
          >
            {item}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {label && (
        <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold w-24 shrink-0">
          {label}:
        </span>
      )}

      {kept.map((item) => (
        <span
          key={item}
          className="px-2 py-1 bg-gray-100 rounded text-gray-700 border border-gray-200"
        >
          {item}
        </span>
      ))}
      {removed.map((item) => (
        <span
          key={item}
          className="px-2 py-1 bg-red-100 text-red-700 rounded border border-red-200 line-through"
        >
          {item}
        </span>
      ))}
      {added.map((item) => (
        <span
          key={item}
          className="px-2 py-1 bg-green-100 text-green-700 rounded border border-green-200"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function DiffArray<T>({
  oldArray,
  newArray,
  keyFn,
  renderItem,
  renderDiff,
}: {
  oldArray: T[];
  newArray: T[];
  keyFn: (item: T) => string;
  renderItem: (
    item: T,
    status: "added" | "removed" | "unchanged",
  ) => React.ReactNode;
  renderDiff: (oldItem: T, newItem: T) => React.ReactNode;
}) {
  // Simple matching by key
  const oldMap = new Map(oldArray.map((item) => [keyFn(item), item]));
  const newMap = new Map(newArray.map((item) => [keyFn(item), item]));

  const allKeys = Array.from(
    new Set([...oldArray.map(keyFn), ...newArray.map(keyFn)]),
  );

  // We want to preserve order as much as possible.
  // A simple approach: iterate new array.
  // If item is in old, check for equality.
  // If not, it's added.
  // Then check for items in old that weren't visited (removed).

  // Better visual approach:
  // 1. Process items in order of New Array.
  // 2. Identify if they match an old item.
  // 3. If match, show Diff if changed, or Unchanged item.
  // 4. If no match, show Added.
  // 5. Finally show Removed items (those in old but not new).

  const processedKeys = new Set<string>();

  return (
    <div className="space-y-4">
      {newArray.map((newItem) => {
        const key = keyFn(newItem);
        processedKeys.add(key);
        const oldItem = oldMap.get(key);

        if (oldItem) {
          // Check if deep equal? Or just assume if JSON stringify differs.
          if (JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
            return (
              <Fragment key={key}>{renderDiff(oldItem, newItem)}</Fragment>
            );
          } else {
            return (
              <Fragment key={key}>{renderItem(newItem, "unchanged")}</Fragment>
            );
          }
        } else {
          return <Fragment key={key}>{renderItem(newItem, "added")}</Fragment>;
        }
      })}

      {oldArray.map((oldItem) => {
        const key = keyFn(oldItem);
        if (!processedKeys.has(key)) {
          return (
            <Fragment key={key}>{renderItem(oldItem, "removed")}</Fragment>
          );
        }
        return null;
      })}
    </div>
  );
}

function getStatusColor(status: "added" | "removed" | "unchanged") {
  switch (status) {
    case "added":
      return "bg-green-50 border-green-200 text-green-900";
    case "removed":
      return "bg-red-50 border-red-200 text-red-900 opacity-60";
    default:
      return "bg-gray-50 border-gray-200 text-gray-500";
  }
}
