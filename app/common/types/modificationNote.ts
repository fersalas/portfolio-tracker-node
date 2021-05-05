export type ModificationNote = {
  modified_on: Date;
  modified_by: string | null;
  modification_note?: string;
};

export const ModificationNote = {
  modified_on: Date,
  modified_by: String,
  modification_note: String
};
