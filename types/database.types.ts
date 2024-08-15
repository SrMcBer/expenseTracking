export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      Account: {
        Row: {
          created_at: string
          id: number
          nombre: string
          saldo: number
          tipo: string
        }
        Insert: {
          created_at?: string
          id?: number
          nombre?: string
          saldo?: number
          tipo?: string
        }
        Update: {
          created_at?: string
          id?: number
          nombre?: string
          saldo?: number
          tipo?: string
        }
        Relationships: []
      }
      AssetFlow: {
        Row: {
          account_id: number | null
          concept: string
          created_at: string
          credit: number
          debit: number
          id: number
        }
        Insert: {
          account_id?: number | null
          concept?: string
          created_at?: string
          credit?: number
          debit?: number
          id?: number
        }
        Update: {
          account_id?: number | null
          concept?: string
          created_at?: string
          credit?: number
          debit?: number
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "AssetFlow_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "Account"
            referencedColumns: ["id"]
          },
        ]
      }
      Compra: {
        Row: {
          account_id: number | null
          concept: string | null
          created_at: string
          id: number
          total: number
          url_factura: string | null
          user: string
        }
        Insert: {
          account_id?: number | null
          concept?: string | null
          created_at?: string
          id?: number
          total?: number
          url_factura?: string | null
          user?: string
        }
        Update: {
          account_id?: number | null
          concept?: string | null
          created_at?: string
          id?: number
          total?: number
          url_factura?: string | null
          user?: string
        }
        Relationships: [
          {
            foreignKeyName: "Compra_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "Account"
            referencedColumns: ["id"]
          },
        ]
      }
      Compra_Det: {
        Row: {
          compra_id: number
          created_at: string
          det_id: number
          producto_id: number
          purchase_value: number
          quantity: number
        }
        Insert: {
          compra_id: number
          created_at?: string
          det_id?: number
          producto_id: number
          purchase_value?: number
          quantity?: number
        }
        Update: {
          compra_id?: number
          created_at?: string
          det_id?: number
          producto_id?: number
          purchase_value?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "Compra_Det_compra_id_fkey"
            columns: ["compra_id"]
            isOneToOne: false
            referencedRelation: "Compra"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Compra_Det_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "Product"
            referencedColumns: ["id"]
          },
        ]
      }
      Payment_Method: {
        Row: {
          account_id: number | null
          created_at: string
          id: number
          sale_id: number
          value: number
        }
        Insert: {
          account_id?: number | null
          created_at?: string
          id?: number
          sale_id: number
          value?: number
        }
        Update: {
          account_id?: number | null
          created_at?: string
          id?: number
          sale_id?: number
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "Payment_Method_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "Account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Payment_Method_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "Sales"
            referencedColumns: ["id"]
          },
        ]
      }
      Payments: {
        Row: {
          account_id: number
          concept: string
          created_at: string
          id: number
          value: number
        }
        Insert: {
          account_id: number
          concept?: string
          created_at?: string
          id?: number
          value?: number
        }
        Update: {
          account_id?: number
          concept?: string
          created_at?: string
          id?: number
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "Payments_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "Account"
            referencedColumns: ["id"]
          },
        ]
      }
      Product: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: number
          inventory: number | null
          name: string
          purchase_price: number
          sale_price: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: number
          inventory?: number | null
          name?: string
          purchase_price?: number
          sale_price?: number
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: number
          inventory?: number | null
          name?: string
          purchase_price?: number
          sale_price?: number
        }
        Relationships: []
      }
      Sales: {
        Row: {
          created_at: string
          id: number
          note: string
          total: number
          username: string
        }
        Insert: {
          created_at?: string
          id?: number
          note?: string
          total?: number
          username?: string
        }
        Update: {
          created_at?: string
          id?: number
          note?: string
          total?: number
          username?: string
        }
        Relationships: []
      }
      Sales_Det: {
        Row: {
          created_at: string
          id: number
          product_id: number
          quantity: number
          sale_id: number
          total: number
          value: number
        }
        Insert: {
          created_at?: string
          id?: number
          product_id: number
          quantity?: number
          sale_id: number
          total?: number
          value?: number
        }
        Update: {
          created_at?: string
          id?: number
          product_id?: number
          quantity?: number
          sale_id?: number
          total?: number
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "Sales_Det_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "Product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Sales_Det_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "Sales"
            referencedColumns: ["id"]
          },
        ]
      }
      Users: {
        Row: {
          Cargo: string
          created_at: string
          id: string
          username: string
        }
        Insert: {
          Cargo: string
          created_at?: string
          id?: string
          username: string
        }
        Update: {
          Cargo?: string
          created_at?: string
          id?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
