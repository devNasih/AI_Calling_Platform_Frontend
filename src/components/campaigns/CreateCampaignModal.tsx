import React, { useState, useEffect } from "react";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import Modal from "../../components/common/Modal";
import { toast } from "react-hot-toast";
import { useCampaigns } from "../../contexts/CampaignContext";
import { CampaignDBCreate, CampaignType } from "../../types";
import LocationSelector from "../common/LocationSelector";
import { Select as UiSelect } from "../../components/ui/select";
import { useKnowledgeBase } from "../../contexts/KnowledgeBaseContext";
import { useContacts } from "../../contexts/ContactsContext";
import Select, { MultiValue } from "react-select";
import { ContactType } from "@/types/campaign_type";

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void; // replaces onCreated
  campaign?: CampaignType | null; // optional prop
}

interface ContactOption {
  value: number;
  label: string;
}

const CampaignModal: React.FC<CampaignModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  campaign,
}) => {
  const isEdit = !!campaign;

  const [formData, setFormData] = useState<CampaignDBCreate>({
    name: "",
    message: "",
    region: "global",
  });

  const [location, setLocation] = useState({
    country: "",
    state: "",
    city: "",
  });

  const [selectedKB, setSelectedKB] = useState<string>("");
  const [selectedContacts, setSelectedContacts] = useState<ContactOption[]>([]);
  const [loading, setLoading] = useState(false);

  const { documents, fetchDocuments, loadingDocuments } = useKnowledgeBase();
  const { contacts, loading: contactsLoading, refreshContacts } = useContacts();
  const { createCampaign, updateCampaign } = useCampaigns();

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
      refreshContacts();
    }
  }, [isOpen]);

  // Prefill when editing
  useEffect(() => {
    if (isEdit && campaign) {
      setFormData({
        name: campaign.name || "",
        message: campaign.description || "",
        region: "global",
      });
      setLocation({
        country: campaign.country || "",
        state: campaign.state || "",
        city: campaign.city || "",
      });
      setSelectedKB(campaign.knowledge_base_file_id?.toString() || "");
      setSelectedContacts(
        (campaign.contact_list || []).map((c) => ({
          value: c.id || 0,
          label: `${c.name} (${c.phone_number})`,
        }))
      );
    } else {
      setFormData({ name: "", message: "", region: "global" });
      setLocation({ country: "", state: "", city: "" });
      setSelectedKB("");
      setSelectedContacts([]);
    }
  }, [isEdit, campaign, isOpen]);

  const contactOptions: ContactOption[] = contacts.map((c) => ({
    value: c.id,
    label: `${c.name} (${c.phone_number})`,
  }));

  const optionsWithSelectAll = [
    { value: -1, label: "Select All Contacts" },
    ...contactOptions,
  ];

  const handleContactChange = (selected: MultiValue<ContactOption>) => {
    const isSelectAll = selected.some((s) => s.value === -1);
    setSelectedContacts(
      isSelectAll ? contactOptions : (selected as ContactOption[])
    );
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!selectedKB) {
      toast.error("Please select a Knowledge Base");
      return;
    }
    if (selectedContacts.length === 0) {
      toast.error("Please select at least one contact");
      return;
    }

    const contactList: ContactType[] = selectedContacts
      .map((c) => contacts.find((ct) => ct.id === c.value))
      .filter((contact): contact is typeof contact => !!contact)
      .map((contact) => ({
        name: contact.name,
        phone_number: contact.phone_number,
        country: contact.country,
        state: contact.state,
        city: contact.city,
      }));

    const payload = {
      name: formData.name,
      description: formData.message,
      country: location.country || "global",
      state: location.state,
      city: location.city,
      knowledge_base_file_id: parseInt(selectedKB, 10),
      contact_list: contactList,
    };

    try {
      setLoading(true);

      if (isEdit && campaign) {
        await updateCampaign(campaign.id, payload);
        toast.success("Campaign updated successfully!");
      } else {
        await createCampaign(payload);
        toast.success("Campaign created successfully!");
      }

      onClose();
      onSaved();
    } catch (err: any) {
      console.error("Failed to create campaign:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Campaign" : "Create New Campaign"}
    >
      <div className="space-y-4">
        {/* Campaign Name */}
        <div>
          <Label htmlFor="name">Campaign Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter campaign name"
          />
        </div>

        {/* Message */}
        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            placeholder="Enter campaign message"
            rows={4}
          />
        </div>

        {/* Knowledge Base */}
        <div>
          <Label htmlFor="knowledgeBase">Knowledge Base</Label>
          <UiSelect
            id="knowledgeBase"
            value={selectedKB}
            onChange={(e) => setSelectedKB(e.target.value)}
            disabled={loadingDocuments}
          >
            <option value="">
              {loadingDocuments ? "Loading..." : "Select Knowledge Base"}
            </option>
            {documents?.documents?.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.filename}
              </option>
            ))}
          </UiSelect>
        </div>

        {/* Contacts Multi-Select */}
        <div>
          <Label>Select Contacts</Label>
          <Select
            isMulti
            options={optionsWithSelectAll}
            value={selectedContacts}
            onChange={handleContactChange}
            isLoading={contactsLoading}
            placeholder="Search or select contacts..."
            closeMenuOnSelect={false}
          />
        </div>

        {/* Location Selector */}
        <div>
          <LocationSelector
            value={location}
            onChange={setLocation}
            showLabels={true}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading
              ? isEdit
                ? "Saving..."
                : "Creating..."
              : isEdit
              ? "Save Changes"
              : "Create Campaign"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CampaignModal;
