#!/bin/bash

# Knight Tree Net - Database Setup Script
# Chạy script này với: bash setup_db.sh

echo "=== Knight Tree Net - Database Setup ==="
echo ""

# Step 1: Configure PostgreSQL authentication
echo "Step 1: Configuring PostgreSQL authentication..."
sudo sed -i 's/local   all             postgres                                peer/local   all             postgres                                md5/' /etc/postgresql/*/main/pg_hba.conf

if [ $? -eq 0 ]; then
    echo "✅ Authentication configured"
else
    echo "❌ Failed to configure authentication"
    exit 1
fi

# Step 2: Restart PostgreSQL
echo ""
echo "Step 2: Restarting PostgreSQL..."
sudo systemctl restart postgresql

if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL restarted"
else
    echo "❌ Failed to restart PostgreSQL"
    exit 1
fi

# Step 3: Set postgres user password
echo ""
echo "Step 3: Setting postgres user password..."
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"

if [ $? -eq 0 ]; then
    echo "✅ Password set"
else
    echo "❌ Failed to set password"
    exit 1
fi

# Step 4: Create database
echo ""
echo "Step 4: Creating database..."
PGPASSWORD=postgres psql -U postgres -h localhost -c "CREATE DATABASE knight_tree_net;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Database created"
else
    echo "⚠️  Database might already exist, continuing..."
fi

# Step 5: Import schema
echo ""
echo "Step 5: Importing database schema..."
cd /home/khoa/quan-ly-tiem-net/backend
PGPASSWORD=postgres psql -U postgres -h localhost -d knight_tree_net -f database/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Schema imported"
else
    echo "❌ Failed to import schema"
    exit 1
fi

# Step 6: Verify
echo ""
echo "Step 6: Verifying database..."
COUNT=$(PGPASSWORD=postgres psql -U postgres -h localhost -d knight_tree_net -t -c "SELECT COUNT(*) FROM workstations;")

if [ "$COUNT" -eq 20 ]; then
    echo "✅ Database verified - Found 20 workstations"
else
    echo "⚠️  Warning: Expected 20 workstations, found: $COUNT"
fi

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Next steps:"
echo "1. Start backend:  cd backend && npm run dev"
echo "2. Start frontend: npm run dev"
echo ""
echo "Test backend: curl http://localhost:5000/api/health"
