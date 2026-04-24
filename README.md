# BFHL Full Stack Challenge

This repository contains the complete full-stack solution for the SRM Full Stack Engineering Challenge. It features a Node.js REST API that processes complex hierarchical node structures (including cycle detection, multi-parent handling, and duplicate tracking) alongside a clean Vanilla JS frontend for interaction.

The entire infrastructure is automated and deployed to **AWS Elastic Beanstalk** using **Terraform**.

## Features
- **Graph Parsing Logic**: 
  - Validates formatting (e.g. `X->Y`).
  - Separates out `invalid_entries` and tracks `duplicate_edges`.
  - Discards secondary parents seamlessly to break false cycles.
- **Cycle Detection**: Identifies independent trees and pure cycles, returning `has_cycle: true` without calculating depth for cycles.
- **Tree Depth Calculation**: Calculates the deepest root-to-leaf path dynamically.
- **Summary Generation**: Calculates `total_trees`, `total_cycles`, and handles tiebreakers (lexicographically smallest) for `largest_tree_root`.

## API Specification

**Endpoint:** `POST /bfhl`  
**Content-Type:** `application/json`

### Example Request Body
```json
{
  "data": [
    "A->B", "A->C", "B->D", "C->E", "E->F",
    "X->Y", "Y->Z", "Z->X",
    "P->Q", "Q->R",
    "G->H", "G->H", "G->I",
    "hello", "1->2", "A->"
  ]
}
```

## Local Development Setup

To run this application locally on your machine:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SpeedGotFried/bhfl-challenge.git
   cd bhfl-challenge
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the server:**
   ```bash
   npm start
   ```
4. **View the Frontend:**
   Open your browser and navigate to `http://localhost:3000`.

## Cloud Deployment (AWS Infrastructure as Code)

This project uses **Terraform** to provision AWS infrastructure completely automatically. The template zips the codebase, creates an S3 bucket, provisions an Elastic Beanstalk environment (Node.js 20), and deploys the app.

**Deployment Steps:**
1. Ensure the `aws-cli` and `terraform` are installed on your machine.
2. Navigate to the `aws/` directory:
   ```bash
   cd aws
   ```
3. Initialize and Apply:
   ```bash
   terraform init
   terraform apply
   ```
4. Terraform will output the live `api_url` once provisioning is complete (usually ~3-5 minutes).

## Architecture & Tech Stack
- **Backend**: Node.js, Express
- **Frontend**: HTML5, CSS3, Vanilla JS
- **Cloud Infrastructure**: AWS Elastic Beanstalk, Amazon S3, AWS IAM
- **IaC Tool**: Terraform
