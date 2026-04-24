terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = "us-east-1" # Change if deploying to a different region
}

# 1. Package the Node.js application (Exclude node_modules and aws folder)
data "archive_file" "app_zip" {
  type        = "zip"
  source_dir  = "${path.module}/.."
  output_path = "${path.module}/app.zip"
  excludes    = ["node_modules", "aws", ".git"]
}

# 2. Create S3 Bucket for the Application Version
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "eb_bucket" {
  bucket = "bfhl-eb-app-bucket-${random_id.bucket_suffix.hex}"
}

# 3. Upload Zip to S3
resource "aws_s3_object" "app_zip_obj" {
  bucket = aws_s3_bucket.eb_bucket.id
  key    = "app-${data.archive_file.app_zip.output_md5}.zip"
  source = data.archive_file.app_zip.output_path
}

# 4. IAM Roles for Elastic Beanstalk
resource "aws_iam_role" "eb_ec2_role" {
  name = "eb-ec2-role-${random_id.bucket_suffix.hex}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "eb_web_tier" {
  role       = aws_iam_role.eb_ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
}

resource "aws_iam_instance_profile" "eb_ec2_profile" {
  name = "eb-ec2-profile-${random_id.bucket_suffix.hex}"
  role = aws_iam_role.eb_ec2_role.name
}

# 5. Elastic Beanstalk Application
resource "aws_elastic_beanstalk_application" "bfhl_app" {
  name        = "bfhl-challenge-api"
  description = "BFHL Challenge Node.js API"
}

# 6. Elastic Beanstalk Application Version
resource "aws_elastic_beanstalk_application_version" "bfhl_version" {
  name        = "bfhl-v-${data.archive_file.app_zip.output_md5}"
  application = aws_elastic_beanstalk_application.bfhl_app.name
  bucket      = aws_s3_bucket.eb_bucket.id
  key         = aws_s3_object.app_zip_obj.id
}

# 7. Elastic Beanstalk Environment
resource "aws_elastic_beanstalk_environment" "bfhl_env" {
  name                = "bfhl-challenge-env"
  application         = aws_elastic_beanstalk_application.bfhl_app.name
  solution_stack_name = "64bit Amazon Linux 2023 v6.10.1 running Node.js 20"
  version_label       = aws_elastic_beanstalk_application_version.bfhl_version.name

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.eb_ec2_profile.name
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "EnvironmentType"
    value     = "SingleInstance" # Saves cost for challenge
  }
}

# 8. Output the live URL
output "api_url" {
  value       = "http://${aws_elastic_beanstalk_environment.bfhl_env.cname}/bfhl"
  description = "The public URL to your POST /bfhl API"
}

output "frontend_url" {
  value       = "http://${aws_elastic_beanstalk_environment.bfhl_env.cname}"
  description = "The public URL to view the frontend UI"
}
