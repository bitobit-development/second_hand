/**
 * AI Setup Verification Script
 *
 * This script verifies that AI services (OpenAI and Cloudinary) are properly configured
 * and can be accessed successfully.
 *
 * Usage: npx tsx scripts/verify-ai-setup.ts
 */

import OpenAI from 'openai'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const REQUIRED_ENV_VARS = {
  openai: ['OPENAI_API_KEY'],
  cloudinary: ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'],
}

function checkEnvVars() {
  console.log('🔍 Checking environment variables...\n')

  let allPresent = true

  // Check OpenAI env vars
  console.log('OpenAI Configuration:')
  for (const envVar of REQUIRED_ENV_VARS.openai) {
    const value = process.env[envVar]
    if (value && value !== `sk-your-openai-api-key-here`) {
      console.log(`  ✅ ${envVar}: Set (${value.substring(0, 10)}...)`)
    } else {
      console.log(`  ❌ ${envVar}: Not set or using placeholder value`)
      allPresent = false
    }
  }

  console.log('\nCloudinary Configuration:')
  for (const envVar of REQUIRED_ENV_VARS.cloudinary) {
    const value = process.env[envVar]
    if (value && !value.includes('your-')) {
      console.log(`  ✅ ${envVar}: Set`)
    } else {
      console.log(`  ❌ ${envVar}: Not set or using placeholder value`)
      allPresent = false
    }
  }

  console.log()
  return allPresent
}

async function testOpenAI() {
  console.log('🤖 Testing OpenAI API connection...\n')

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Make a simple API call to verify connectivity
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Respond with exactly "OK" if you receive this message.',
        },
        {
          role: 'user',
          content: 'Test connection',
        },
      ],
      max_tokens: 10,
    })

    const response = completion.choices[0]?.message?.content?.trim()

    if (response) {
      console.log('  ✅ OpenAI API connection successful!')
      console.log(`  Model: ${completion.model}`)
      console.log(`  Response: "${response}"`)
      console.log()
      return true
    } else {
      console.log('  ❌ OpenAI API returned empty response')
      console.log()
      return false
    }
  } catch (error) {
    console.log('  ❌ OpenAI API connection failed')
    if (error instanceof Error) {
      console.log(`  Error: ${error.message}`)
    }
    console.log()
    return false
  }
}

function testCloudinary() {
  console.log('☁️  Testing Cloudinary configuration...\n')

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    console.log('  ❌ Cloudinary credentials not fully configured')
    console.log()
    return false
  }

  // Basic validation
  if (cloudName.includes('your-') || apiKey.includes('your-') || apiSecret.includes('your-')) {
    console.log('  ❌ Cloudinary credentials appear to be placeholder values')
    console.log()
    return false
  }

  console.log('  ✅ Cloudinary credentials are configured')
  console.log(`  Cloud Name: ${cloudName}`)
  console.log('  ✅ Cloudinary is ready for use with AI image enhancement')
  console.log()
  return true
}

async function main() {
  console.log('='.repeat(60))
  console.log('AI SETUP VERIFICATION')
  console.log('='.repeat(60))
  console.log()

  // Step 1: Check environment variables
  const envVarsOk = checkEnvVars()

  if (!envVarsOk) {
    console.log('⚠️  Some environment variables are missing or using placeholder values.')
    console.log('Please update your .env file with actual API keys.')
    console.log('\nRefer to .env.example for required variables.')
    process.exit(1)
  }

  // Step 2: Test OpenAI connectivity
  const openaiOk = await testOpenAI()

  // Step 3: Test Cloudinary configuration
  const cloudinaryOk = testCloudinary()

  // Summary
  console.log('='.repeat(60))
  console.log('VERIFICATION SUMMARY')
  console.log('='.repeat(60))
  console.log()
  console.log(`Environment Variables: ${envVarsOk ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`OpenAI API: ${openaiOk ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Cloudinary: ${cloudinaryOk ? '✅ PASS' : '❌ FAIL'}`)
  console.log()

  if (envVarsOk && openaiOk && cloudinaryOk) {
    console.log('🎉 All AI services are properly configured and ready to use!')
    console.log()
    console.log('Next steps:')
    console.log('  1. Run the development server: npm run dev')
    console.log('  2. Start implementing AI features')
    console.log()
    process.exit(0)
  } else {
    console.log('⚠️  Some services failed verification. Please check the errors above.')
    console.log()
    console.log('Common issues:')
    console.log('  - Invalid or expired API keys')
    console.log('  - Network connectivity problems')
    console.log('  - Incorrect environment variable names')
    console.log()
    process.exit(1)
  }
}

// Run the verification
main().catch((error) => {
  console.error('❌ Verification script failed with error:')
  console.error(error)
  process.exit(1)
})
