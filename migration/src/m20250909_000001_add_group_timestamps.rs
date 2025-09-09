use sea_orm_migration::prelude::*;

use crate::m20220912_000002_create_group_table::Group;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let current_timestamp = chrono::Utc::now().timestamp();
        
        // Add created_at column with default value for existing groups
        manager
            .alter_table(
                Table::alter()
                    .table(Group::Table)
                    .add_column(
                        ColumnDef::new(GroupTimestamps::CreatedAt)
                            .integer()
                            .not_null()
                            .default(current_timestamp)
                    )
                    .to_owned(),
            )
            .await?;

        // Add updated_at column with default value for existing groups
        manager
            .alter_table(
                Table::alter()
                    .table(Group::Table)
                    .add_column(
                        ColumnDef::new(GroupTimestamps::UpdatedAt)
                            .integer()
                            .not_null()
                            .default(current_timestamp)
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(Group::Table)
                    .drop_column(GroupTimestamps::UpdatedAt)
                    .drop_column(GroupTimestamps::CreatedAt)
                    .to_owned(),
            )
            .await
    }
}

#[derive(Iden)]
pub enum GroupTimestamps {
    CreatedAt,
    UpdatedAt,
}