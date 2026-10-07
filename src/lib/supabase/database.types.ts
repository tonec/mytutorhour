
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "families": {
                  Row: {
                    "contact_email": string | null,"contact_name": string,"contact_phone": string | null,"created_at": string,"id": string,"name": string,"tutor_id": string,"updated_at": string
                  }
                  Insert: {
                    "contact_email"?: string | null,"contact_name": string,"contact_phone"?: string | null,"created_at"?: string,"id"?: string,"name": string,"tutor_id"?: string,"updated_at"?: string
                  }
                  Update: {
                    "contact_email"?: string | null,"contact_name"?: string,"contact_phone"?: string | null,"created_at"?: string,"id"?: string,"name"?: string,"tutor_id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"student_tags": {
                  Row: {
                    "student_id": string,"tag_id": string,"tutor_id": string
                  }
                  Insert: {
                    "student_id": string,"tag_id": string,"tutor_id"?: string
                  }
                  Update: {
                    "student_id"?: string,"tag_id"?: string,"tutor_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "student_tags_student_id_tutor_id_fkey"
      columns: ["student_id","tutor_id"]
isOneToOne: false
      referencedRelation: "students"
      referencedColumns: ["id","tutor_id"]
    },{
      foreignKeyName: "student_tags_tag_id_tutor_id_fkey"
      columns: ["tag_id","tutor_id"]
isOneToOne: false
      referencedRelation: "tags"
      referencedColumns: ["id","tutor_id"]
    }
                  ]
                },"students": {
                  Row: {
                    "created_at": string,"email": string | null,"exam_board": string | null,"family_id": string | null,"first_name": string,"id": string,"last_name": string | null,"level": string,"notes": string | null,"phone": string | null,"subject": string,"tutor_id": string,"type": Database["public"]['Enums']["student_type"],"updated_at": string
                  }
                  Insert: {
                    "created_at"?: string,"email"?: string | null,"exam_board"?: string | null,"family_id"?: string | null,"first_name": string,"id"?: string,"last_name"?: string | null,"level": string,"notes"?: string | null,"phone"?: string | null,"subject": string,"tutor_id"?: string,"type": Database["public"]['Enums']["student_type"],"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"email"?: string | null,"exam_board"?: string | null,"family_id"?: string | null,"first_name"?: string,"id"?: string,"last_name"?: string | null,"level"?: string,"notes"?: string | null,"phone"?: string | null,"subject"?: string,"tutor_id"?: string,"type"?: Database["public"]['Enums']["student_type"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "students_family_fk"
      columns: ["family_id","tutor_id"]
isOneToOne: false
      referencedRelation: "families"
      referencedColumns: ["id","tutor_id"]
    }
                  ]
                },"tags": {
                  Row: {
                    "created_at": string,"id": string,"name": string,"tutor_id": string,"updated_at": string
                  }
                  Insert: {
                    "created_at"?: string,"id"?: string,"name": string,"tutor_id"?: string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name"?: string,"tutor_id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "create_tag":
{ Args: { "p_name": string }; Returns: {
              "created_at": string,
"id": string,
"name": string,
"tutor_id": string,
"updated_at": string
            }
                          SetofOptions: {
        from: "*"
        to: "tags"
        isOneToOne: true
        isSetofReturn: false
      } },
"rename_tag":
{ Args: { "p_id": string,"p_name": string }; Returns: undefined
                           },
"save_student":
{ Args: { "p_email"?: string,"p_exam_board"?: string,"p_family_id"?: string,"p_first_name": string,"p_id"?: string,"p_last_name"?: string,"p_level": string,"p_notes"?: string,"p_phone"?: string,"p_subject": string,"p_tag_ids"?: (string)[],"p_type": Database["public"]['Enums']["student_type"] }; Returns: string
                           }
          }
          Enums: {
            "student_type": "adult"|"child"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "student_type": ["adult", "child"]
          }
        }
} as const
