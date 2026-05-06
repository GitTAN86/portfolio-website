import HomeClient from "@/components/HomeClient";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default async function Home() {
  let data = {
    heroName: "",
    heroTagline: "",
    heroHeadline: "",
    aboutText: "",
    skills: [],
    experience: []
  };

  try {
    const response = await fetch(
      "https://firestore.googleapis.com/v1/projects/portfolio-6c69f/databases/(default)/documents/content/main",
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (response.ok) {
      const result = await response.json();
      // Firestore REST API returns data in a 'fields' object with types
      const fields = result.fields;
      
      // Helper to extract values from Firestore REST format
      const extractValue = (field) => {
        if (!field) return null;
        if (field.stringValue !== undefined) return field.stringValue;
        if (field.arrayValue !== undefined) return field.arrayValue.values?.map(v => extractValue(v)) || [];
        if (field.mapValue !== undefined) {
          const map = {};
          for (const key in field.mapValue.fields) {
            map[key] = extractValue(field.mapValue.fields[key]);
          }
          return map;
        }
        return null;
      };

      data = {
        heroName: extractValue(fields.heroName) || "",
        heroTagline: extractValue(fields.heroTagline) || "",
        heroHeadline: extractValue(fields.heroHeadline) || "",
        aboutText: extractValue(fields.aboutText) || "",
        skills: extractValue(fields.skills) || [],
        experience: extractValue(fields.experience) || [],
        profileImage: extractValue(fields.profileImage) || "",
        gallery: extractValue(fields.gallery) || [],
        linkedin: extractValue(fields.linkedin) || "",
        email: extractValue(fields.email) || "",
        whatsapp: extractValue(fields.whatsapp) || ""
      };
    }
  } catch (error) {
    console.error("Error fetching CMS data from REST API:", error);
  }

  return <HomeClient initialData={data} />;
}
